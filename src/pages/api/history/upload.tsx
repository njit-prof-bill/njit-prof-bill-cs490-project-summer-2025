import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { initializeApp, cert, getApps, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

// ✅ FIX: Use proper type for serviceAccount to avoid ESLint `any` error
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY!) as ServiceAccount;

const uploadDir = path.join(process.cwd(), "public/uploads");
const extractDir = path.join(process.cwd(), "public/extracted");
const parsedDir = path.join(process.cwd(), "public/parsed");

// Ensure all directories exist
[uploadDir, extractDir, parsedDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Initialize Firebase only once
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }

  try {
    const formidable = (await import("formidable")).default;
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      multiples: false,
    });

    form.parse(req, async (err, fields, files) => {
      if (err || !files.file) {
        console.error("Form parse error:", err);
        return res.status(400).json({ status: "error", message: "Upload failed or no file." });
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const filePath = file.filepath;
      const fileName = path.basename(filePath);

      const extractScriptPath = path.join(process.cwd(), "scripts/extract_text.py");
      const extractedTxtPath = path.join(extractDir, `${fileName}.txt`);

      execFile("python3", [extractScriptPath, filePath, extractedTxtPath], (extractErr) => {
        if (extractErr) {
          console.error("Text extraction failed:", extractErr);
          return res.status(500).json({ status: "error", message: "Text extraction failed." });
        }

        const parseScriptPath = path.join(process.cwd(), "scripts/parse_resume_github_proxy.py");
        const parsedJsonPath = path.join(parsedDir, `${fileName}.json`);

        execFile("python3", [parseScriptPath, extractedTxtPath, parsedJsonPath], async (parseErr, stdout, stderr) => {
          if (parseErr) {
            console.error("Parsing failed:", stderr);
            return res.status(500).json({ status: "error", message: "Resume parsing failed" });
          }

          try {
            const parsedContent = fs.readFileSync(parsedJsonPath, "utf-8");
            const parsedData = JSON.parse(parsedContent);

            // ✅ Verify Firebase Auth token and upload parsed JSON to Firestore
            const token = req.headers.authorization?.split("Bearer ")[1];
            if (!token) throw new Error("Missing Authorization token");

            const decoded = await getAuth().verifyIdToken(token);
            const uid = decoded.uid;

            await db.collection("users").doc(uid).collection("history_upload").add({
              ...parsedData,
              source: "upload",
              timestamp: new Date(),
            });

            console.log("Uploaded parsed resume to Firestore for user:", uid);
            return res.status(200).json({ status: "processing", fileId: fileName });
          } catch (dbErr) {
            console.error("Failed to upload to Firebase:", dbErr);
            return res.status(500).json({ status: "error", message: "Firebase upload failed" });
          }
        });
      });
    });
  } catch (e) {
    console.error("Handler error:", e);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
