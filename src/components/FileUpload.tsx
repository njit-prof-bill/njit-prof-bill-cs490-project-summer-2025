"use client";

import { useState, useRef, useEffect } from "react";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

import mammoth from "mammoth";
import JSZip from "jszip";
import DocumentList from "./DocumentList";
import { marked } from "marked";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null); // Track previewed file name
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files from localStorage on mount
  useEffect(() => {
    const files = JSON.parse(localStorage.getItem("localDocuments") || "[]");
    setDocuments(files);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.endsWith(ext))) {
      setError("Unsupported file type.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(null); // Do not auto-preview on select
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = () => {
        let base64 = reader.result as string;
        // If .md file, force MIME type to text/markdown
        if (selectedFile.name.toLowerCase().endsWith('.md') && base64.startsWith('data:text/plain')) {
          base64 = base64.replace('data:text/plain', 'data:text/markdown');
        }
        const newDoc = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          lastModified: selectedFile.lastModified,
          base64,
          uploadedAt: new Date().toISOString(),
        };
        const updatedDocs = [newDoc, ...documents];
        setDocuments(updatedDocs);
        localStorage.setItem("localDocuments", JSON.stringify(updatedDocs));
        setSelectedFile(null);
        setPreviewUrl(null);
        if (onParsed) {
          onParsed({ fileName: selectedFile.name });
        }
        setUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError("Upload failed. Try again.");
      setUploading(false);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  // Optionally, add a delete handler for local files
  const handleDelete = (name: string) => {
    const updatedDocs = documents.filter((doc: any) => doc.name !== name);
    setDocuments(updatedDocs);
    localStorage.setItem("localDocuments", JSON.stringify(updatedDocs));
  };

  // Preview handler for local files and selected file
  const handlePreview = (doc: any) => {
    setPreviewUrl(doc.base64 || previewUrl);
    setPreviewName(doc.name || doc.fileName || null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
      <div className="w-full flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleChooseFile}
          disabled={uploading}
          className="w-48 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 font-semibold"
        >
          Choose File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedExtensions.join(",")}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </div>
      {selectedFile && (
        <div className="w-full flex flex-col items-center gap-2">
          <span className="text-sm text-gray-800 dark:text-gray-200">Selected: {selectedFile.name}</span>
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button
              onClick={() => { setSelectedFile(null); setPreviewUrl(null); setError(null); }}
              disabled={uploading}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Preview the selected file before upload
                if (selectedFile) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    let result = reader.result as string;
                    // If .md file, force MIME type to text/markdown
                    if (selectedFile.name.toLowerCase().endsWith('.md') && result.startsWith('data:text/plain')) {
                      result = result.replace('data:text/plain', 'data:text/markdown');
                    }
                    setPreviewUrl(result);
                    setPreviewName(selectedFile.name);
                  };
                  reader.readAsDataURL(selectedFile);
                }
              }}
              disabled={uploading || !selectedFile}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Preview
            </button>
          </div>
        </div>
      )}
      {error && <div className="text-red-500 dark:text-red-400">{error}</div>}
      <div className="w-full mt-4">
        <DocumentList
          documents={documents.map((doc: any) => ({
            ...doc,
            type: getFileTypeLabel(doc),
            createdAt: doc.uploadedAt,
            fileName: doc.name, // Ensure fileName is always present
            onPreview: () => handlePreview({ base64: doc.base64, name: doc.name }), // Always pass both base64 and name
          }))}
        />
      </div>
      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button
              onClick={() => { setPreviewUrl(null); setPreviewName(null); }}
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-2xl font-bold"
              aria-label="Close preview"
            >
              ×
            </button>
            <div className="overflow-auto max-h-[70vh]">
              {(() => {
                // Always use previewName for extension check
                const fileName = previewName || '';
                const lowerName = fileName.toLowerCase();
                // Treat any .md file as Markdown, regardless of MIME type
                const isMarkdown = lowerName.endsWith('.md');
                if (previewUrl.startsWith('data:application/pdf')) {
                  return <iframe src={previewUrl} title="PDF Preview" className="w-full h-[60vh] bg-white dark:bg-gray-900" />;
                } else if (previewUrl.startsWith('data:image')) {
                  return <img src={previewUrl} alt="Preview" className="max-w-full max-h-[60vh] mx-auto bg-white dark:bg-gray-900" />;
                } else if (previewUrl.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                  return <DocxPreview base64={previewUrl} />;
                } else if (previewUrl.startsWith('data:application/vnd.oasis.opendocument.text')) {
                  return <OdtPreview base64={previewUrl} />;
                } else if (isMarkdown) {
                  return <MarkdownPreview base64={previewUrl} />;
                } else if (previewUrl.startsWith('data:text')) {
                  try {
                    const base64 = previewUrl.split(',')[1];
                    const text = atob(base64);
                    return <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">{text}</div>;
                  } catch {
                    return <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">Unable to preview this file type.</div>;
                  }
                } else {
                  return (
                    <div className="flex flex-col items-center">
                      <span className="text-gray-600 dark:text-gray-300 mb-2">Unable to preview this file type.</span>
                      <a href={previewUrl} download className="text-blue-600 dark:text-blue-400 underline">Download file</a>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for DOCX preview
function DocxPreview({ base64 }: { base64: string }) {
  const [text, setText] = useState<string>("Loading preview...");
  useEffect(() => {
    async function extractDocx() {
      try {
        const arr = base64.split(",")[1];
        const byteArray = Uint8Array.from(atob(arr), c => c.charCodeAt(0));
        const result = await mammoth.extractRawText({ arrayBuffer: byteArray.buffer });
        setText(result.value || "No text found in DOCX.");
      } catch {
        setText("Unable to preview this DOCX file.");
      }
    }
    extractDocx();
  }, [base64]);
  return <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">{text}</div>;
}

// Helper component for ODT preview
function OdtPreview({ base64 }: { base64: string }) {
  const [text, setText] = useState<string>("Loading preview...");
  useEffect(() => {
    async function extractOdt() {
      try {
        const arr = base64.split(",")[1];
        const byteArray = Uint8Array.from(atob(arr), c => c.charCodeAt(0));
        const zip = await JSZip.loadAsync(byteArray.buffer);
        const contentXml = await zip.file("content.xml")?.async("string");
        if (!contentXml) throw new Error("No content.xml found");
        // Extract text from XML (very basic, not perfect)
        const matches = contentXml.match(/<text:p[^>]*>(.*?)<\/text:p>/g);
        const paragraphs = matches ? matches.map(p => p.replace(/<[^>]+>/g, "").trim()) : [];
        setText(paragraphs.join("\n\n") || "No text found in ODT.");
      } catch {
        setText("Unable to preview this ODT file.");
      }
    }
    extractOdt();
  }, [base64]);
  return <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">{text}</div>;
}

// Markdown preview helper
function MarkdownPreview({ base64 }: { base64: string }) {
  const [html, setHtml] = useState<string>("Loading preview...");
  useEffect(() => {
    async function renderMarkdown() {
      try {
        if (!base64 || !base64.includes(',')) {
          setHtml("No Markdown content to preview.");
          return;
        }
        const arr = base64.split(",")[1];
        if (!arr) {
          setHtml("No Markdown content to preview.");
          return;
        }
        const text = atob(arr);
        if (!text.trim()) {
          setHtml("No Markdown content to preview.");
          return;
        }
        const result = await marked.parse(text);
        setHtml(result as string);
      } catch {
        setHtml("Unable to preview this Markdown file.");
      }
    }
    renderMarkdown();
  }, [base64]);
  return (
    <div className="prose max-w-none text-gray-800 dark:text-gray-200">
      {html === "Loading preview..." ? (
        <span className="italic text-gray-400">Loading preview...</span>
      ) : html === "Unable to preview this Markdown file." || html === "No Markdown content to preview." ? (
        <span className="italic text-red-500 dark:text-red-400">{html}</span>
      ) : (
        <span dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
}

// Helper to get a friendly file type label
function getFileTypeLabel(doc: any) {
  const ext = doc.name?.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'docx') return 'DOCX';
  if (ext === 'txt') return 'TXT';
  if (ext === 'md') return 'MD';
  if (ext === 'odt') return 'ODT';
  return doc.type?.toUpperCase() || 'FILE';
}

