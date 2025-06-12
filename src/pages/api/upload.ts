import nextConnect from "next-connect";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { db } from "@/lib/firebaseAdmin"; // Make sure this exists

const upload = multer({ dest: "uploads/" });
const apiRoute = nextConnect();

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  const file = req.file;
  const ext = file.originalname.split(".").pop().toLowerCase();
  let text = "";

  try {
    if (ext === "pdf") {
      const data = fs.readFileSync(file.path);
      const parsed = await pdfParse(data);
      text = parsed.text;
    } else if (ext === "docx") {
      const result = await mammoth.extractRawText({ path: file.path });
      text = result.value;
    } else if (["txt", "md", "odt"].includes(ext)) {
      text = fs.readFileSync(file.path, "utf-8");
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const docRef = await db.collection("uploads").add({
      filename: file.originalname,
      content: text,
      uploadedAt: new Date(),
    });

    res.status(200).json({ message: "Uploaded", docId: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process file" });
  } finally {
    fs.unlinkSync(file.path); // Delete uploaded file after use
  }
});

export const config = {
  api: {
    bodyParser: false, // Required for multer
  },
};

export default apiRoute;
