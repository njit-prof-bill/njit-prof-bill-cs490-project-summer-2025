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
} from "lucide-react";

type UploadedRecord = {
  id: string;
  filename: string;
  createdAt: string; // ISO timestamp
  type: string;
};

export default function UploadedItems() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<UploadedRecord[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "icon">("list");

  // helper to fetch the uploads list
  const fetchUploads = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/uploads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error("fetchUploads failed:", res.status);
        return;
      }
      const data = (await res.json()) as UploadedRecord[];
      // convert uploadDate to ISO if needed
      setItems(
        data.map((f) => ({
          ...f,
          // ensure createdAt is a string
          createdAt: new Date(f.createdAt).toISOString(),
        }))
      );
    } catch (err) {
      console.error("Error in fetchUploads:", err);
    }
  };

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    // initial fetch
    fetchUploads();

    // then poll every 5 seconds
    const handle = setInterval(fetchUploads, 5_000);

    return () => clearInterval(handle);
  }, [user]);

  if (loading) return null;

  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div>
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

      {viewMode === "list" ? (
        <ul className="space-y-2">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between p-2 bg-neutral-800 rounded"
            >
              <div className="flex items-center space-x-2">
                {it.type === "text" ? (
                  <FileText className="h-5 w-5 text-neutral-200" />
                ) : (
                  <FileIcon className="h-5 w-5 text-neutral-200" />
                )}
                <span className="text-neutral-100">{it.filename}</span>
              </div>
              <span className="text-sm text-neutral-400">
                {formatDate(it.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex flex-col items-center p-2 bg-neutral-800 rounded"
            >
              {it.type === "text" ? (
                <FileText className="h-8 w-8 text-neutral-200" />
              ) : (
                <FileIcon className="h-8 w-8 text-neutral-200" />
              )}
              <span className="mt-2 text-sm text-neutral-100 truncate">
                {it.filename}
              </span>
              <span className="mt-1 text-xs text-neutral-400">
                {new Date(it.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
