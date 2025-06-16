import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }

  const form = new IncomingForm({ uploadDir, keepExtensions: true, multiples: false });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ status: "error", message: "Upload failed" });
    }

    const uploaded = files.file;
    if (!uploaded || (Array.isArray(uploaded) && uploaded.length === 0)) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    const fileId = path.basename(file.filepath);

    return res.status(200).json({ status: "processing", fileId });
  });
}
