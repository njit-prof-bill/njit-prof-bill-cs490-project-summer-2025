"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { X } from "lucide-react";

interface FileProgress {
  file: File;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  downloadUrl?: string;
  error?: string;
}

const createFileProgress = (file: File): FileProgress => ({
  file,
  progress: 0,
  status: "idle",
});

export default function UploadCard() {
  const [fileList, setFileList] = useState<FileProgress[]>([]);

  const isValidFile = (file: File) => {
    const isValidType =
      file.type === "application/pdf" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const isValidSize = file.size <= 2 * 1024 * 1024;
    return isValidType && isValidSize;
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(isValidFile);
    setFileList((prev) => [...prev, ...dropped.map(createFileProgress)]);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter(isValidFile);
    setFileList((prev) => [...prev, ...selected.map(createFileProgress)]);
  };

  const handleRemove = (index: number) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const updatedList = [...fileList];

    for (let i = 0; i < updatedList.length; i++) {
      const item = updatedList[i];
      const storageRef = ref(storage, `resumes/${item.file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, item.file);

      updatedList[i].status = "uploading";
      setFileList([...updatedList]);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          updatedList[i].progress = percent;
          setFileList([...updatedList]);
        },
        (error) => {
          updatedList[i].status = "error";
          updatedList[i].error = "Upload failed.";
          setFileList([...updatedList]);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          updatedList[i].status = "success";
          updatedList[i].downloadUrl = url;
          setFileList([...updatedList]);
        }
      );
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Upload Resumes</CardTitle>
      </CardHeader>
      <CardContent>
        <label
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative block border-2 border-dashed border-gray-400 rounded-md p-6 text-center cursor-pointer mb-4"
        >
          <input
            type="file"
            accept=".pdf,.docx"
            multiple
            onChange={handleSelect}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <div className="relative z-0 pointer-events-none">
            Drag and drop PDF or DOCX files here
            <br />
            or click to browse
          </div>
        </label>

        {fileList.length > 0 && (
          <ul className="space-y-3 mb-4 text-sm">
            {fileList.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-2 border-b pb-1"
              >
                <div className="flex-1">
                  <span className="block truncate">{item.file.name}</span>

                  {item.status !== "success" && (
                    <div className="w-full bg-gray-200 rounded h-2 mt-1">
                      <div
                        className={`h-2 rounded ${
                          item.status === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}

                  {item.status === "error" && (
                    <p className="text-red-600 text-xs mt-1">{item.error}</p>
                  )}
                  {item.status === "success" && item.downloadUrl && (
                    <a
                      href={item.downloadUrl}
                      target="_blank"
                      className="text-green-700 underline text-xs mt-1 inline-block"
                    >
                      View File
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => handleRemove(index)}
                  disabled={item.status === "uploading"}
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <Button
          onClick={handleUpload}
          disabled={
            fileList.length === 0 || fileList.some((f) => f.status === "uploading")
          }
        >
          Upload {fileList.length > 1 ? "All" : "File"}
        </Button>
      </CardContent>
    </Card>
  );
}
