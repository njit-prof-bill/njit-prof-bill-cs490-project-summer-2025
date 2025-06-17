"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { uploadFileWithToken } from "@/lib/upload";

interface FileProgress {
  file: File;
  progress: number;
  status: "idle" | "uploading" | "processing" | "success" | "error";
}

export default function UploadCard() {
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    setFileProgress(prev => {
      const newFiles: FileProgress[] = [];

      Array.from(files).forEach(file => {
        const isDuplicate = prev.some(
          p => p.file.name === file.name && p.file.size === file.size && p.status !== "success"
        );
        if (!isDuplicate) {
          newFiles.push({ file, progress: 0, status: "idle" });
        }
      });

      return [...prev, ...newFiles];
    });
  };

  const handleUpload = async () => {
    for (const fp of fileProgress) {
      setFileProgress(prev =>
        prev.map(p => p.file === fp.file ? { ...p, status: "uploading" } : p)
      );

      // Simulate progress bar for uploading
      setFileProgress(prev =>
        prev.map(p => p.file === fp.file ? { ...p, progress: 50 } : p)
      );

      try {
        const result = await uploadFileWithToken(fp.file);

        setFileProgress(prev =>
          prev.map(p =>
            p.file === fp.file
              ? {
                  ...p,
                  status: result === "success" ? "processing" : "error",
                  progress: 100,
                }
              : p
          )
        );

        if (result === "success") {
          setTimeout(() => {
            setFileProgress(prev => prev.filter(p => p.file !== fp.file));
          }, 1500);
        }
      } catch (err) {
        console.error("Upload error:", err);
        setFileProgress(prev =>
          prev.map(p => p.file === fp.file ? { ...p, status: "error" } : p)
        );
      }
    }
  };

  const removeFile = (file: File) => {
    setFileProgress(prev => prev.filter(p => p.file !== file));
  };

  const getProgressColor = (status: FileProgress["status"]) => {
    switch (status) {
      case "error":
        return "bg-red-500";
      case "processing":
        return "bg-indigo-500";
      case "success":
        return "bg-green-500";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Upload Resume Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={e => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer mb-4"
        >
          <div className="relative z-0 pointer-events-none">
            Drag and drop PDF or DOCX files here
            <br />
            or click to browse
          </div>
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            multiple
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
            }}
            onChange={e => handleFiles(e.target.files)}
            accept=".pdf,.doc,.docx"
          />
        </div>

        {fileProgress.map((fp, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-center text-sm mb-1">
              <span>{fp.file.name}</span>
              {(() => {
                switch (fp.status) {
                  case "uploading":
                    return (
                      <span className="flex items-center text-blue-600">
                        <Loader2 className="animate-spin mr-1" size={16} /> Uploading
                      </span>
                    );
                  case "processing":
                    return (
                      <span className="flex items-center text-indigo-600">
                        <Loader2 className="animate-spin mr-1" size={16} /> Processing
                      </span>
                    );
                  default:
                    return (
                      <button onClick={() => removeFile(fp.file)} className="text-red-500 hover:underline">
                        <X size={16} />
                      </button>
                    );
                }
              })()}
            </div>
            <div className="w-full h-2 bg-gray-200 rounded">
              <div
                className={`h-2 rounded transition-all duration-300 ${getProgressColor(fp.status)}`}
                style={{ width: `${fp.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleUpload} disabled={fileProgress.length === 0}>
          Upload
        </Button>
      </CardFooter>
    </Card>
  );
}
