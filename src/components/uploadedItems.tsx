// src/components/UploadedItems.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  } from "react";
import { useAuth } from "@/context/authContext";
import { useProfile } from "@/context/profileContext";
import { Button } from "@/components/ui/button";
import {
  List,
  Grid as GridIcon,
  File as FileIcon,
  FileText,
  X,
  GripVertical,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import * as mammoth from "mammoth";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type UploadedRecord = {
  id: string;
  filename: string;
  createdAt: string; // ISO timestamp
  type: string;
  order?: number;
};

type SortBy = "order" | "name" | "date" | "type";
type SortDir = "asc" | "desc";

function SortableTile(props: {
  record: UploadedRecord;
  fmt: (iso: string) => string;
  onClick: (r: UploadedRecord) => void;
  onDelete: (id: string) => void;
  getTypeLabel: (m: string) => string;
  viewMode: "list" | "icon";
  token: string;
  onParse: (id: string) => void;
  isParsing: boolean;
}) {
  const {
    record: it,
    fmt,
    onClick,
    onDelete,
    getTypeLabel,
    viewMode,
    token,
    onParse,
    isParsing,
  } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: it.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    cursor: isDragging ? "grabbing" : "grab",
  };

  const thumbnailUrl =
    `/api/download?id=${encodeURIComponent(it.id)}` +
    `&type=upload&token=${encodeURIComponent(token)}`;

  const deleteBtn = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (confirm(`Delete “${it.filename}”?`)) onDelete(it.id);
      }}
      className="p-1 hover:text-red-500"
    >
      <X className="h-4 w-4" />
    </button>
  );

  const parseBtn = (
    <Button
      size="sm"
      variant="outline"
      disabled={isParsing}
      onClick={(e) => {
        e.stopPropagation();
        onParse(it.id);
      }}
    >
      {isParsing ? "Parsing…" : "Parse"}
    </Button>
  );

  if (viewMode === "list") {
    return (
      <li
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => onClick(it)}
        style={style}
        className="flex items-center justify-between p-2.5 bg-neutral-800 rounded hover:bg-neutral-700 cursor-pointer"
      >
        <div {...attributes} {...listeners} className="p-1 cursor-grab hover:text-blue-400">
          <GripVertical className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {it.type.startsWith("text/") ? (
            <FileText className="h-5 w-5 text-neutral-200 flex-shrink-0" />
          ) : (
            <FileIcon className="h-5 w-5 text-neutral-200 flex-shrink-0" />
          )}
          <span className="text-neutral-100 truncate">{it.filename}</span>
          <span className="ml-2 text-xs uppercase bg-neutral-700 text-neutral-300 px-1 rounded truncate">
            {getTypeLabel(it.type)}
          </span>
        </div>
        <span className="ml-4 text-sm text-neutral-400 whitespace-nowrap flex-shrink-0">
          {fmt(it.createdAt)}
        </span>
        <div className="ml-4 flex items-center space-x-2">
          {parseBtn}
          {deleteBtn}
        </div>
      </li>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onClick(it)}
      style={style}
      className="relative flex flex-col items-center justify-center p-4 bg-neutral-800 rounded hover:bg-neutral-700"
    >
      {it.type === "application/pdf" ? (
        <embed
          src={thumbnailUrl}
          type="application/pdf"
          className="w-full h-32 object-cover rounded pointer-events-none"
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
        <span className="block text-sm text-neutral-100 truncate">{it.filename}</span>
        <span className="block text-xs uppercase bg-neutral-700 text-neutral-300 inline-block px-1 rounded truncate">
          {getTypeLabel(it.type)}
        </span>
        <span className="block text-xs text-neutral-400 truncate">
          {new Date(it.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="absolute top-1 right-1 flex space-x-1">
        <Button
          size="icon"
          variant="outline"
          disabled={isParsing}
          onClick={(e) => {
            e.stopPropagation();
            onParse(it.id);
          }}
        >
          {isParsing ? "…" : "⟳"}
        </Button>
        {deleteBtn}
      </div>
    </div>
  );
}

export default function UploadedItems() {
  const { user, loading } = useAuth();
  const { parseFile } = useProfile();
  const [items, setItems] = useState<UploadedRecord[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "icon">("list");
  const [token, setToken] = useState<string>("");

  const [sortBy, setSortBy] = useState<SortBy>("order");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [selected, setSelected] = useState<UploadedRecord | null>(null);
  const [previewMode, setPreviewMode] = useState<
    "pdf" | "docx" | "md" | "text" | "other" | null
  >(null);
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  // track which file is currently being parsed
  const [parsingId, setParsingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const getTypeLabel = (mime: string) =>
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ? "docx"
      : mime.split("/")[1] || mime;
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  // Fetch uploads
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    if (!token) return;
    let tried = false;
    const fetchUploads = async () => {
      const res = await fetch("/api/uploads", { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 && !tried) {
        tried = true;
        const fresh = await user.getIdToken(true);
        setToken(fresh);
        return;
      }
      if (!res.ok) return console.error("fetchUploads failed", res.status);
      const data = (await res.json()) as UploadedRecord[];
      setItems(data.map((f) => ({ ...f, createdAt: new Date(f.createdAt).toISOString() })));
    };
    fetchUploads();
    const iv = setInterval(fetchUploads, 5000);
    return () => clearInterval(iv);
  }, [user, token]);

  useEffect(() => {
    if (user) user.getIdToken().then(setToken);
  }, [user]);

  const sortedItems = React.useMemo(() => {
    if (sortBy === "order") return sortDir === "asc" ? items : [...items].reverse();
    const arr = [...items];
    let cmp: (a: UploadedRecord, b: UploadedRecord) => number;
    if (sortBy === "name") cmp = (a, b) => a.filename.localeCompare(b.filename);
    else if (sortBy === "type")
      cmp = (a, b) => getTypeLabel(a.type).localeCompare(getTypeLabel(b.type));
    else cmp = (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    arr.sort((a, b) => (sortDir === "asc" ? cmp(a, b) : -cmp(a, b)));
    return arr;
  }, [items, sortBy, sortDir]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = sortedItems.findIndex((i) => i.id === active.id);
        const newIndex = sortedItems.findIndex((i) => i.id === over.id);
        const next = arrayMove(sortedItems, oldIndex, newIndex);
        setItems(next);
        fetch("/api/uploads/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderedIds: next.map((i) => i.id) }),
        }).catch(console.error);
      }
    },
    [sortedItems, token]
  );

  const handleDelete = useCallback(
    (id: string) => {
      fetch(`/api/uploads?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (res.ok) setItems((prev) => prev.filter((f) => f.id !== id));
      });
    },
    [token]
  );

  const handleParse = useCallback(
    (id: string) => {
      setParsingId(id);
      parseFile(id)
        .catch((err) => alert(`Parse failed: ${err.message}`))
        .finally(() => setParsingId(null));
    },
    [parseFile]
  );

  const openItem = async (it: UploadedRecord) => {
    if (!user) return;
    setSelected(it);
    setLoadingContent(true);
    setTextContent(null);
    setContentUrl(null);

    const downloadUrl = `/api/download?id=${encodeURIComponent(it.id)}&type=upload&token=${encodeURIComponent(token)}`;
    setContentUrl(downloadUrl);
    const res = await fetch(downloadUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return setLoadingContent(false);

    const blob = await res.blob();
    const previewMap: Record<string, "pdf" | "docx" | "md" | "text"> = {
      "application/pdf": "pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
      "text/markdown": "md",
      "text/plain": "text",
    };
    const mode = previewMap[it.type] ?? (it.type.startsWith("text/") ? "text" : "other");
    setPreviewMode(mode);

    if (mode === "docx") {
      const { value } = await mammoth.convertToHtml({ arrayBuffer: await blob.arrayBuffer() });
      setTextContent(value);
    } else if (mode === "md" || mode === "text") {
      setTextContent(await blob.text());
    }
    setLoadingContent(false);
  };

  const closeModal = () => {
    setSelected(null);
    setPreviewMode(null);
    setTextContent(null);
    if (contentUrl) URL.revokeObjectURL(contentUrl);
    setContentUrl(null);
  };

  if (loading) return null;

  return (
    <div>
      {/* header + toggle */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-semibold text-neutral-100">Your Uploads</h4>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setViewMode("list")}>
            <List className={`h-5 w-5 ${viewMode === "list" ? "text-blue-400" : "text-neutral-400"}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setViewMode("icon")}>
            <GridIcon className={`h-5 w-5 ${viewMode === "icon" ? "text-blue-400" : "text-neutral-400"}`} />
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
          <option value="order">Order</option>
          <option value="name">Name</option>
          <option value="date">Date</option>
          <option value="type">Type</option>
        </select>
        <button onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} className="bg-neutral-800 text-neutral-100 text-sm rounded px-2 py-1">
          {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortedItems.map((i) => i.id)} strategy={viewMode === "list" ? verticalListSortingStrategy : rectSortingStrategy}>
          {viewMode === "list" ? (
            <ul className="space-y-2">
              {sortedItems.map((it) => (
                <SortableTile
                  key={it.id}
                  record={it}
                  fmt={fmt}
                  onClick={openItem}
                  onDelete={handleDelete}
                  onParse={handleParse}
                  getTypeLabel={getTypeLabel}
                  viewMode="list"
                  token={token}
                  isParsing={parsingId === it.id}
                />
              ))}
            </ul>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {sortedItems.map((it) => (
                <SortableTile
                  key={it.id}
                  record={it}
                  fmt={fmt}
                  onClick={openItem}
                  onDelete={handleDelete}
                  onParse={handleParse}
                  getTypeLabel={getTypeLabel}
                  viewMode="icon"
                  token={token}
                  isParsing={parsingId === it.id}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 max-w-3xl w-full max-h-[80vh] overflow-auto rounded-lg p-6 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-semibold text-neutral-100 mb-4">
              <a href={contentUrl!} download={selected.filename} className="text-blue-400 underline">
                {selected.filename}
              </a>
            </h2>

            {loadingContent ? (
              <p className="text-neutral-400">Loading…</p>
            ) : previewMode === "pdf" ? (
              <iframe src={contentUrl!} className="w-full h-[70vh] border" title={selected.filename} />
            ) : previewMode === "docx" ? (
              <div className="prose prose-invert max-w-none text-neutral-200" dangerouslySetInnerHTML={{ __html: textContent! }} />
            ) : previewMode === "md" ? (
              <div className="prose prose-invert overflow-auto text-neutral-200">
                <ReactMarkdown>{textContent!}</ReactMarkdown>
              </div>
            ) : previewMode === "text" ? (
              <pre className="whitespace-pre-wrap text-neutral-200">{textContent}</pre>
            ) : (
              <p className="text-neutral-400">No preview available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
