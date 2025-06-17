// src/pages/api/history/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public/uploads");
const extractDir = path.join(process.cwd(), "public/extracted");
const parsedDir = path.join(process.cwd(), "public/parsed");

// Ensure all directories exist
[uploadDir, extractDir, parsedDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

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

      // Step 1: Extract text from PDF/DOCX
      const extractScriptPath = path.join(process.cwd(), "scripts/extract_text.py");
      const extractedTxtPath = path.join(extractDir, `${fileName}.txt`);

      execFile("python3", [extractScriptPath, filePath, extractedTxtPath], (extractErr) => {
        if (extractErr) {
          console.error("Text extraction failed:", extractErr);
          return res.status(500).json({ status: "error", message: "Text extraction failed." });
        }

        // Step 2: Parse extracted text with GitHub GPT-4o Mini proxy
        const parseScriptPath = path.join(process.cwd(), "scripts/parse_resume_github_proxy.py");
        const parsedJsonPath = path.join(parsedDir, `${fileName}.json`);

        execFile("python3", [parseScriptPath, extractedTxtPath, parsedJsonPath], (parseErr, stdout, stderr) => {
          if (parseErr) {
            console.error("Parsing failed:", stderr);
            return res.status(500).json({ status: "error", message: "Resume parsing failed" });
          }

          console.log("Parsing complete:", stdout);
          return res.status(200).json({ status: "processing", fileId: fileName });
        });
      });
    });
  } catch (e) {
    console.error("Handler error:", e);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
