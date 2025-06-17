"use client";

import { useState, useRef } from "react";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

import mammoth from "mammoth";
import JSZip from "jszip";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "application/vnd.oasis.opendocument.text",
];

const allowedExtensions = [".pdf", ".docx", ".txt", ".md", ".odt"];

interface FileUploadProps {
  onParsed: (parsedData: any) => void; // callback to send parsed resume data upstream
}

export default function FileUpload({ onParsed }: { onParsed: (data: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error" | "nofile"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isValidFile = (file: File) => {
    const mimeOk = allowedTypes.includes(file.type);
    const extOk = allowedExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    return mimeOk || extOk;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      setStatus("idle");
      return;
    }

    if (isValidFile(selected)) {
      setFile(selected);
      setStatus("idle");
    } else {
      alert("Unsupported file type.");
      setFile(null);
      setStatus("idle");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const extractText = async (file: File): Promise<string> => {
    const ext = file.name.toLowerCase();

    if (ext.endsWith(".pdf")) {
      const pdfData = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }

      return text;
    } else if (ext.endsWith(".docx")) {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value;
    } else if (ext.endsWith(".odt")) {
      // Use JSZip to extract content.xml and parse text
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const contentXml = await zip.file("content.xml")?.async("string");
      if (!contentXml) return "";
      // Extract text from XML (very basic, strips tags)
      const text = contentXml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return text;
    } else {
      // For .txt, .md — use readAsText
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject("Error reading file");
        reader.readAsText(file);
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("nofile");
      return;
    }

    setStatus("uploading");

    try {
      const rawText = await extractText(file);

      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });

      if (!res.ok) throw new Error("API error");

      const parsed = await res.json();

      onParsed(parsed); // send parsed data upstream

      setStatus("success");
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="flex flex-row items-center space-x-2">
          <label className="px-4 py-2 bg-gray-200 text-black rounded cursor-pointer inline-block">
            Choose File
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md,.odt"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
          </label>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={status === "uploading" || !file}
          >
            {status === "uploading" ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Uploading...
              </>
            ) : (
              "Upload File"
            )}
          </button>
        </div>
      </div>
      {file && (
        <span className="block text-sm text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-gray-800 px-3 py-1 rounded shadow mt-2">
          Selected file: {file.name}
        </span>
      )}
      {status === "success" && (
        <p className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 font-semibold px-3 py-1 rounded shadow mt-2">
          File uploaded and parsed successfully!
        </p>
      )}
      {/* Status messages can be added here if needed */}
    </div>
  );
}
