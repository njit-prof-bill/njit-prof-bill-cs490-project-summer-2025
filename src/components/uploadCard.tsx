"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FileProgress {
  file: File;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
}

export default function UploadCard() {
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles: FileProgress[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: "idle"
    }));
    setFileProgress(prev => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    fileProgress.forEach(fp => {
      const formData = new FormData();
      formData.append("file", fp.file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/history/upload");

      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          setFileProgress(prev =>
            prev.map(p => p.file === fp.file ? { ...p, progress: percent } : p)
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setFileProgress(prev =>
            prev.map(p => p.file === fp.file ? { ...p, status: "success" } : p)
          );
          setTimeout(() => {
            setFileProgress(prev => prev.filter(p => p.file !== fp.file));
          }, 1000);
        } else {
          setFileProgress(prev =>
            prev.map(p => p.file === fp.file ? { ...p, status: "error" } : p)
          );
        }
      };

      xhr.onerror = () => {
        setFileProgress(prev =>
          prev.map(p => p.file === fp.file ? { ...p, status: "error" } : p)
        );
      };

      setFileProgress(prev =>
        prev.map(p => p.file === fp.file ? { ...p, status: "uploading" } : p)
      );

      xhr.send(formData);
    });
  };

  const removeFile = (file: File) => {
    setFileProgress(prev => prev.filter(p => p.file !== file));
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
            onChange={e => handleFiles(e.target.files)}
            accept=".pdf,.doc,.docx"
          />
        </div>

        {fileProgress.map((fp, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>{fp.file.name}</span>
              <button onClick={() => removeFile(fp.file)} className="text-red-500 hover:underline"><X size={16} /></button>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded">
              <div
                className={`h-2 rounded transition-all duration-300 ${
                  fp.status === "error" ? "bg-red-500" : "bg-blue-600"
                }`}
                style={{ width: `${fp.progress}%` }}
              ></div>
            </div>
          </div>
        ))}

        {/* <Button onClick={handleUpload} disabled={fileProgress.length === 0}>
          Upload
        </Button> */}
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleUpload} disabled={fileProgress.length === 0}>
          Upload
        </Button>
      </CardFooter>
    </Card>
  );
}