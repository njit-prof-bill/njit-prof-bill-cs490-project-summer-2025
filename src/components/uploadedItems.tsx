// src/components/UploadedItems.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { Button } from "@/components/ui/button";
import {
  List,
  Grid as GridIcon,
  File as FileIcon,
  FileText,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import * as mammoth from "mammoth";

type UploadedRecord = {
  id: string;
  filename: string;
  createdAt: string; // ISO timestamp
  type: string;
};

type SortBy = "name" | "date" | "type";
type SortDir = "asc" | "desc";

export default function UploadedItems() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<UploadedRecord[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "icon">("list");
  const [token, setToken] = useState<string>("");

  // helper to turn MIME into a short label
  const getTypeLabel = (mime: string) =>
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ? "docx"
      : mime.split("/")[1] || mime;

  // sorting
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      let diff = 0;
      if (sortBy === "name") {
        diff = a.filename.localeCompare(b.filename);
      } else if (sortBy === "type") {
        // use the short label here:
        diff = getTypeLabel(a.type).localeCompare(getTypeLabel(b.type));
      } else {
        diff =
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? diff : -diff;
    });
  }, [items, sortBy, sortDir]);

  // for modal
  const [selected, setSelected] = useState<UploadedRecord | null>(null);
  const [previewMode, setPreviewMode] = useState<
    "pdf" | "docx" | "md" | "text" | "other" | null
  >(null);
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  // grab a fresh Firebase ID token once on mount
  useEffect(() => {
    if (!user) return;
    user.getIdToken().then(setToken);
  }, [user]);

  // poll the list every 5s
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const fetchUploads = async () => {
      try {
        const res = await fetch("/api/uploads", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error("fetchUploads failed:", res.status);
          return;
        }
        const data = (await res.json()) as UploadedRecord[];
        setItems(
          data.map((f) => ({
            ...f,
            createdAt: new Date(f.createdAt).toISOString(),
          }))
        );
      } catch (err) {
        console.error("Error in fetchUploads:", err);
      }
    };

    fetchUploads();
    const handle = setInterval(fetchUploads, 5_000);
    return () => clearInterval(handle);
  }, [user, token]);

  if (loading) return null;

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  // when you click a thumbnail or list item
  const openItem = async (it: UploadedRecord) => {
    if (!user) return;
    setSelected(it);
    setLoadingContent(true);
    setTextContent(null);
    setContentUrl(null);

    // download + preview URL
    const downloadUrl =
      `/api/download?id=${encodeURIComponent(it.id)}` +
      `&type=upload&token=${encodeURIComponent(token)}`;

    setContentUrl(downloadUrl);

    const res = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error("download failed", res.status);
      setLoadingContent(false);
      return;
    }

    // pick preview mode
    const previewModeMap = {
      "application/pdf": "pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
      "text/markdown": "md",
      "text/*": "text",
    } as const;

    const fetchDocxContent = async () => {
      // .docx → HTML via mammoth
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
      setTextContent(html);
    };
    const fetchTextContent = async (downloadUrl: string, token: string) => {
      const r2 = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const txt = await r2.text();
      setTextContent(txt);
    };

    // Determine the preview mode using a map
    const mode =
      previewModeMap[it.type as keyof typeof previewModeMap] ||
      (it.type.startsWith("text/") ? "text" : "other");

    // Set preview mode and fetch text content if needed
    setPreviewMode(mode);

    if (mode === "docx") await fetchDocxContent();
    else if (mode === "md" || mode === "text") {
      await fetchTextContent(downloadUrl, token);
    }

    setLoadingContent(false);
  };

  const closeModal = () => {
    setSelected(null);
    setPreviewMode(null);
    setTextContent(null);
    if (contentUrl) {
      URL.revokeObjectURL(contentUrl);
      setContentUrl(null);
    }
  };

  return (
    <div>
      {/* header + toggle */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-semibold text-neutral-100">
          Your Uploads
        </h4>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List
              className={`h-5 w-5 ${
                viewMode === "list" ? "text-blue-400" : "text-neutral-400"
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("icon")}
          >
            <GridIcon
              className={`h-5 w-5 ${
                viewMode === "icon" ? "text-blue-400" : "text-neutral-400"
              }`}
            />
          </Button>
        </div>
      </div>

      {/* SORT BAR */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm text-neutral-400">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="bg-neutral-800 text-neutral-100 text-sm rounded px-2 py-1"
        >
          <option value="name">Name</option>
          <option value="date">Date</option>
          <option value="type">Type</option>
        </select>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="bg-neutral-800 text-neutral-100 text-sm rounded px-2 py-1"
        >
          {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <ul className="space-y-2">
          {sortedItems.map((it) => (
            <li
              key={it.id}
              onClick={() => openItem(it)}
              className="flex items-center justify-between p-2.5 bg-neutral-800 rounded hover:bg-neutral-700 cursor-pointer"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {it.type === "text" ? (
                  <FileText className="h-5 w-5 text-neutral-200 flex-shrink-0" />
                ) : (
                  <FileIcon className="h-5 w-5 text-neutral-200 flex-shrink-0" />
                )}
                <span className="text-neutral-100 truncate">
                  {it.filename}
                </span>
                <span className="ml-2 text-xs uppercase bg-neutral-700 text-neutral-300 px-1 rounded truncate">
                  {getTypeLabel(it.type)}
                </span>
              </div>
              <span className="ml-4 text-sm text-neutral-400 whitespace-nowrap flex-shrink-0">
                {fmt(it.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* ICON / THUMBNAIL VIEW */}
      {viewMode === "icon" && (
        <div className="grid grid-cols-3 gap-4">
          {sortedItems.map((it) => {
            const thumbnailUrl =
              `/api/download?id=${encodeURIComponent(it.id)}` +
              `&type=upload&token=${encodeURIComponent(token)}`;

            return (
              <div
                key={it.id}
                onClick={() => openItem(it)}
                className="cursor-pointer flex flex-col items-center justify-center p-4 bg-neutral-800 rounded hover:bg-neutral-700"
              >
                {it.type === "application/pdf" ? (
                  <embed
                    src={thumbnailUrl}
                    type="application/pdf"
                    className="w-full h-32 object-cover rounded"
                  />
                ) : it.type.startsWith("text/") ? (
                  <embed
                    src={thumbnailUrl}
                    type={it.type}
                    className="w-full h-32 object-cover rounded whitespace-pre-wrap overflow-hidden"
                  />
                ) : (
                  <FileIcon className="h-8 w-8 text-neutral-200" />
                )}

                <div className="mt-2 text-center w-full">
                  <span className="block text-sm text-neutral-100 truncate max-w-full">
                    {it.filename}
                  </span>
                  <span className="block text-xs uppercase bg-neutral-700 text-neutral-300 inline-block px-1 rounded truncate max-w-full">
                    {getTypeLabel(it.type)}
                  </span>
                  <span className="block text-xs text-neutral-400 truncate">
                    {new Date(it.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL POPUP */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 max-w-3xl w-full max-h-[80vh] overflow-auto rounded-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-semibold text-neutral-100 mb-4">
              <a
                href={contentUrl!}
                download={selected.filename}
                className="text-blue-400 underline"
              >
                {selected.filename}
              </a>
            </h2>

            {loadingContent ? (
              <p className="text-neutral-400">Loading…</p>
            ) : previewMode === "pdf" ? (
              <iframe
                src={contentUrl!}
                className="w-full h-[70vh] border"
                title={selected.filename}
              />
            ) : previewMode === "docx" ? (
              <div
                className="prose prose-invert max-w-none text-neutral-200"
                dangerouslySetInnerHTML={{ __html: textContent! }}
              />
            ) : previewMode === "md" ? (
              <div className="prose prose-invert overflow-auto text-neutral-200">
                <ReactMarkdown>{textContent!}</ReactMarkdown>
              </div>
            ) : previewMode === "text" ? (
              <pre className="whitespace-pre-wrap text-neutral-200">
                {textContent}
              </pre>
            ) : (
              <p className="text-neutral-400">No preview available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
