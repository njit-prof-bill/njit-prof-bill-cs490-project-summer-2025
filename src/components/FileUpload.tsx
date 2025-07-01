"use client";

import { useState, useRef, useEffect } from "react";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

import mammoth from "mammoth";
import JSZip from "jszip";
import DocumentList from "./DocumentList";
import { marked } from "marked";
import { useAuth } from "@/context/authContext";

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
  setAiLoading?: (loading: boolean) => void; // optional callback to control spinner from parent
}

export default function FileUpload({ onParsed, setAiLoading }: FileUploadProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsingNew, setParsingNew] = useState(false); // NEW: track parsing for new upload
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null); // Track previewed file name
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiLoading, setAiLoadingState] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docListOpen, setDocListOpen] = useState(false);
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
    setParsingNew(false); // reset
    setError(null);
    // Move setUploading(false) to always run after FileReader finishes
    const finishUpload = () => setUploading(false);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        let base64 = reader.result as string;
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
        setSelectedDocId(newDoc.id); // Select new doc to trigger AI parsing
        localStorage.setItem("localDocuments", JSON.stringify(updatedDocs));
        setPreviewUrl(null);
        setParsingNew(true); // Start parsing spinner for new upload
        setUploading(false); // Hide upload spinner, but keep parsing spinner
        // Do NOT clear selectedFile here! Wait until parsing is done.



      };
      reader.onerror = () => {
        setError("Failed to read file.");
        finishUpload();
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError("Upload failed. Try again.");
      finishUpload();
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

  // Helper to extract text from base64 data URL (for txt/md)
  function extractTextFromBase64(base64: string) {
    if (!base64 || !base64.includes(',')) return '';
    const arr = base64.split(',')[1];
    if (!arr) return '';
    try {
      return atob(arr);
    } catch {
      return '';
    }
  }

  // Handler to parse document with AI
  const handleParseAI = async (doc: any) => {
    setAiResult(null);
    setAiError(null);
    setAiLoadingState(true); // Always update local state
    if (setAiLoading) setAiLoading(true);
    let text = '';
    // Only support text-based files for now
    if (doc.base64.startsWith('data:text') || doc.base64.startsWith('data:application/json')) {
      text = extractTextFromBase64(doc.base64);
    } else {
      setAiError('AI parsing is only supported for text-based files.');
      setAiLoadingState(false);
      if (setAiLoading) setAiLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed to parse with AI');
      const data = await res.json();
      setAiResult(data);
    } catch (err: any) {
      setAiError(err.message || 'Error parsing with AI');
    } finally {
      setAiLoadingState(false);
      if (setAiLoading) setAiLoading(false);
    }
  };

  // When a document is selected, parse it with AI in the background
  useEffect(() => {
    if (!selectedDocId) return;
    const doc = documents.find((d: any) => d.id === selectedDocId);
    if (!doc) return;
    setAiResult(null);
    setAiError(null);
    setAiLoadingState(true); // Always update local state
    if (setAiLoading) setAiLoading(true);
    let isNewUpload = false;
    if (selectedFile !== null && parsingNew && doc && doc.name && doc.name === selectedFile.name) {
      // If parsingNew is true, and doc is the new upload, and selectedFile matches
      isNewUpload = true;
    }
    async function extractTextForAI(doc: any): Promise<string> {
      const base64 = doc.base64;
      const fileName = doc.name?.toLowerCase() || '';
      // Always treat .md as text
      if (fileName.endsWith('.md')) {
        return extractTextFromBase64(base64);
      }
      if (base64.startsWith('data:text') || base64.startsWith('data:application/json')) {
        return extractTextFromBase64(base64);
      }
      // PDF
      if (base64.startsWith('data:application/pdf')) {
        try {
          const arr = base64.split(',')[1];
          const byteArray = Uint8Array.from(atob(arr), c => c.charCodeAt(0));
          const pdf = await pdfjsLib.getDocument({ data: byteArray }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ') + '\n';
          }
          return text;
        } catch {
          return '';
        }
      }
      // DOCX
      if (base64.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        try {
          const arr = base64.split(',')[1];
          const byteArray = Uint8Array.from(atob(arr), c => c.charCodeAt(0));
          const result = await mammoth.extractRawText({ arrayBuffer: byteArray.buffer });
          return result.value || '';
        } catch {
          return '';
        }
      }
      // ODT
      if (base64.startsWith('data:application/vnd.oasis.opendocument.text')) {
        try {
          const arr = base64.split(',')[1];
          const byteArray = Uint8Array.from(atob(arr), c => c.charCodeAt(0));
          const zip = await JSZip.loadAsync(byteArray.buffer);
          const contentXml = await zip.file('content.xml')?.async('string');
          if (!contentXml) return '';
          const matches = contentXml.match(/<text:p[^>]*>(.*?)<\/text:p>/g);
          const paragraphs = matches ? matches.map(p => p.replace(/<[^>]+>/g, '').trim()) : [];
          return paragraphs.join('\n\n') || '';
        } catch {
          return '';
        }
      }
      return '';
    }

    (async () => {
      try {
        const text = await extractTextForAI(doc);
        if (!text.trim()) throw new Error('Could not extract text from this file.');
        const res = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error('Failed to parse with AI');
        const data = await res.json();
        setAiResult(data);
const fullResume = {
  emails: [],
  phones: [],
  objective: "",
  skills: [],
  education: [],
  jobHistory: [],
  bio: "",
  ...data,
};

setAiResult(fullResume);
if (onParsed) {
  onParsed({ ...fullResume, fileName: doc.name });
}// Save parsed resume to backend
if (user?.uid && doc) {
  try {
    await fetch("/api/saveResume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...fullResume,
        userId: user.uid,
        bio: "", // no bio at this point
        displayName: doc.name || "Uploaded Resume",
      }),
    });
  } catch (err) {
    console.error(" Failed to save parsed resume after upload:", err);
  }
}


      } catch (err: any) {
        setAiError(err.message || 'Error parsing with AI');
      } finally {
        setAiLoadingState(false);
        if (setAiLoading) setAiLoading(false);
        if (isNewUpload) {
          setParsingNew(false); // Hide spinner in upload button after parsing new upload
          setSelectedFile(null); // Now clear selectedFile so buttons disappear only after parsing
        }
      }
    })();
  }, [selectedDocId, documents]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
      <div className="w-full flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleChooseFile}
          disabled={uploading || parsingNew}
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
          disabled={uploading || parsingNew}
        />
      </div>
      {selectedFile && (
        <div className="w-full flex flex-col items-center gap-2">
          <span className="text-sm text-gray-800 dark:text-gray-200">Selected: {selectedFile.name}</span>
          <div className="flex gap-2 items-center">
            <button
              onClick={handleUpload}
              disabled={uploading || parsingNew || !selectedFile}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {uploading || parsingNew ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Uploading...
                </>
              ) : "Upload"}
            </button>
            <button
              onClick={() => { setSelectedFile(null); setPreviewUrl(null); setError(null); }}
              disabled={uploading || parsingNew}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedFile) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    let result = reader.result as string;
                    if (selectedFile.name.toLowerCase().endsWith('.md') && result.startsWith('data:text/plain')) {
                      result = result.replace('data:text/plain', 'data:text/markdown');
                    }
                    setPreviewUrl(result);
                    setPreviewName(selectedFile.name);
                  };
                  reader.readAsDataURL(selectedFile);
                }
              }}
              disabled={uploading || parsingNew || !selectedFile}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Preview
            </button>
            {/* Spinner for validation/uploading state - now handled in button above */}
          </div>
        </div>
      )}
      {error && <div className="text-red-500 dark:text-red-400">{error}</div>}
      <div className="w-full mt-4">
        <button
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-t-lg font-semibold text-gray-800 dark:text-gray-100 focus:outline-none"
          onClick={() => setDocListOpen((open) => !open)}
          aria-expanded={docListOpen}
          aria-controls="document-list-panel"
        >
          <span>Uploaded Documents</span>
          <svg
            className={`h-5 w-5 transform transition-transform duration-200 ${docListOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {docListOpen && (
          <div id="document-list-panel" className="border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg">
            <DocumentList
              documents={documents.map((doc: any) => ({
                ...doc,
                type: getFileTypeLabel(doc),
                createdAt: doc.uploadedAt,
                fileName: doc.name, // Ensure fileName is always present
                onPreview: () => handlePreview({ base64: doc.base64, name: doc.name }),
                onDelete: () => handleDelete(doc.name), // Pass delete handler
                // Remove isUploading: spinner logic from here!
              }))}
              selectedId={selectedDocId || undefined}
              onSelect={doc => setSelectedDocId(doc.id)}
              aiLoading={aiLoading && !parsingNew} // Only show spinner in list if not parsing new upload
              hideTitle
            />
          </div>
        )}
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
      {/* AI Parse Result Modal */}
      {/* (Removed: AI loading modal, only spinner remains) */}
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

