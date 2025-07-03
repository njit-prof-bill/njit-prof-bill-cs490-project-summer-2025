"use client";

import { useState, useRef, useEffect } from "react";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

import mammoth from "mammoth";
import JSZip from "jszip";
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
  onPreview?: (url: string, name: string) => void; // callback to trigger preview modal in parent
  onUploadSuccess?: () => void; // NEW: callback to refresh resume list
  onBack?: () => void; // NEW: callback for back navigation
}
export default function FileUpload({ onParsed, setAiLoading, onPreview, onUploadSuccess }: FileUploadProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsingNew, setParsingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiLoading, setAiLoadingState] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.endsWith(ext))) {
      setError("Unsupported file type.");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    console.log("[FileUpload] handleUpload called", selectedFile);
    if (!selectedFile) {
      setError("No file selected.");
      return;
    }
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
        setParsingNew(true);
        setUploading(false);
        // Parse with AI immediately after upload
        await handleParseAI({
          name: selectedFile.name,
          type: selectedFile.type,
          base64,
        });
        setParsingNew(false);
        setSelectedFile(null);
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
    // Only support specific file types for AI parsing
    const allowedAIParseExts = ['txt', 'docx', 'pdf', 'md', 'odt'];
    const ext = doc.name?.split('.').pop()?.toLowerCase();
    if (!ext || !allowedAIParseExts.includes(ext)) {
      setAiError('AI parsing is only supported for .txt, .docx, .pdf, .md, and .odt files.');
      setAiLoadingState(false);
      if (setAiLoading) setAiLoading(false);
      return;
    }
    try {
      if (ext === 'pdf') {
        // Extract text from PDF using pdfjs
        const arr = doc.base64.split(',')[1];
        const byteArray = Uint8Array.from(atob(arr), c => c.charCodeAt(0));
        const pdf = await pdfjsLib.getDocument({ data: byteArray }).promise;
        let pdfText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pdfText += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        text = pdfText;
      } else if (ext === 'docx') {
        // Extract text from DOCX using mammoth
        const arr = doc.base64.split(',')[1];
        const byteArray = Uint8Array.from(atob(arr), c => c.charCodeAt(0));
        const result = await mammoth.extractRawText({ arrayBuffer: byteArray.buffer });
        text = result.value || '';
      } else if (ext === 'odt') {
        // Extract text from ODT using JSZip
        const arr = doc.base64.split(',')[1];
        const byteArray = Uint8Array.from(atob(arr), c => c.charCodeAt(0));
        const zip = await JSZip.loadAsync(byteArray.buffer);
        const contentXml = await zip.file('content.xml')?.async('string');
        if (contentXml) {
          const matches = contentXml.match(/<text:p[^>]*>(.*?)<\/text:p>/g);
          const paragraphs = matches ? matches.map(p => p.replace(/<[^>]+>/g, '').trim()) : [];
          text = paragraphs.join('\n\n') || '';
          text = paragraphs.join('\n\n') || '';
        } else {
          text = '';
        }
      } else if (ext === 'md' || ext === 'txt') {
        text = extractTextFromBase64(doc.base64);
      } else {
        setAiError('Unsupported file type for parsing.');
        setAiLoadingState(false);
        if (setAiLoading) setAiLoading(false);
        return;
      }
    } catch (extractErr) {
      setAiError('Failed to extract text from file.');
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
      }
      // Save parsed resume to backend
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
          // Call the upload success callback to refresh the list
          if (typeof onUploadSuccess === 'function') onUploadSuccess();
        } catch (err) {
          console.error(" Failed to save parsed resume after upload:", err);
        }
      }
    } catch (err: any) {
      setAiError(err.message || 'Error parsing with AI');
    } finally {
      setAiLoadingState(false);
      if (setAiLoading) setAiLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full max-w-md mx-auto flex flex-col items-center gap-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-indigo-100 dark:border-gray-700">
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
        {selectedFile && (
          <div className="w-full flex flex-col items-center gap-2 mt-2">
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
                    {parsingNew ? "Parsing..." : "Uploading..."}
                  </>
                ) : "Upload"}
              </button>
              <button
                onClick={() => { setSelectedFile(null); setError(null); }}
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
                      if (onPreview) {
                        onPreview(result, selectedFile.name);
                      }
                    };
                    reader.readAsDataURL(selectedFile);
                  }
                }}
                disabled={uploading || parsingNew || !selectedFile}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Preview
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  disabled={uploading || parsingNew}
                  className="px-4 py-2 bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 text-white rounded hover:from-gray-600 hover:to-gray-800 disabled:opacity-50 font-semibold flex items-center gap-2"
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Back
                </button>
              )}
            </div>
            {/* Show parsing spinner/message */}
            {(parsingNew || aiLoading) && (
              <div className="flex items-center gap-2 mt-2 text-indigo-600 dark:text-indigo-300">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Parsing file, please wait...
              </div>
            )}
            {/* Show success message */}
            {aiResult && !aiError && !parsingNew && !aiLoading && (
              <div className="text-green-600 dark:text-green-400 mt-2">Upload and parse successful!</div>
            )}
            {/* Show error message */}
            {aiError && (
              <div className="text-red-500 dark:text-red-400 mt-2">{aiError}</div>
            )}
          </div>
        )}
        {error && <div className="text-red-500 dark:text-red-400 mt-2">{error}</div>}
      </div>
    </div>
  );
}

// Helper component for DOCX preview
export function DocxPreview({ base64 }: { base64: string }) {
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
export function OdtPreview({ base64 }: { base64: string }) {
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
export function MarkdownPreview({ base64 }: { base64: string }) {
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
  if (!ext) return "File";
  switch (ext) {
    case 'pdf': return "PDF Document";
    case 'docx': return "Word Document";
    case 'txt': return "Text File";
    case 'md': return "Markdown File";
    case 'odt': return "OpenDocument Text";
    default: return "File";
  }
}

