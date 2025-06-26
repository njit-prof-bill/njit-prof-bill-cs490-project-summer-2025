// src/components/fileUpload.tsx
"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";

import { Upload } from "@/components/icons/uploadField";
import { FileText } from "@/components/icons/fileText";
import { File } from "@/components/icons/file";
import { X } from "@/components/icons/X";
import { CheckCircle } from "@/components/icons/checkCircle";
import { AlertCircle } from "@/components/icons/alertCircle";

import { useAuth } from "@/context/authContext";
import { useProfile } from "@/context/profileContext";
import { parseDocument } from "@/utils/documentParserClient";
import { useToast } from "@/context/toastContext";
import { useRouter } from 'next/navigation';


import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface FileUploadItem {
    file: File;
    status: "uploading" | "processing" | "completed" | "error";
    error?: string;
}

const FileUpload: React.FC = () => {
    const [uploadedFiles, setUploadedFiles] = useState<FileUploadItem[]>([]);
    const { user } = useAuth();
    const { parseAndUpdate } = useProfile();
    const toast = useToast();

    const onDrop = async (acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map((file) => ({
            file,
            status: "uploading" as const,
        }));
        setUploadedFiles((prev) => [...prev, ...newFiles]);

        for (let i = 0; i < newFiles.length; i++) {
            const idx = uploadedFiles.length + i;
            const file = newFiles[i].file;

            try {
                // mark as processing
                setUploadedFiles((prev) =>
                    prev.map((f, j) =>
                        j === idx ? { ...f, status: "processing" } : f
                    )
                );

                // parse via API
                const parsedData = await parseDocument(file);
                parseAndUpdate(parsedData);

                // save to Firestore
                if (user) {
                    await addDoc(
                        collection(db, "users", user.uid, "corpus"),
                        {
                            source: "upload",
                            createdAt: serverTimestamp(),
                            ...parsedData,
                        }
                    );
                }

                // mark completed
                setUploadedFiles((prev) =>
                    prev.map((f, j) =>
                        j === idx ? { ...f, status: "completed" } : f
                    )
                );
                toast(`${file.name} processed & saved!`, "success");
            } catch (error) {
                setUploadedFiles((prev) =>
                    prev.map((f, j) =>
                        j === idx
                            ? {
                                ...f,
                                status: "error",
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : "Processing failed",
                            }
                            : f
                    )
                );
                toast(`Failed to process ${file.name}`, "error");
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
                ".docx",
            ],
            "text/plain": [".txt"],
            "text/markdown": [".md"],
        },
        maxSize: 10 * 1024 * 1024,
    });

    const removeFile = (index: number) =>
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split(".").pop()?.toLowerCase();
        switch (ext) {
            case "pdf":
                return <FileText className="h-6 w-6 text-red-500" />;
            case "docx":
                return <FileText className="h-6 w-6 text-blue-400" />;
            default:
                return <File className="h-6 w-6 text-neutral-500" />;
        }
    };

    const getStatusIcon = (status: FileUploadItem["status"]) => {
        switch (status) {
            case "uploading":
            case "processing":
                return (
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                );
            case "completed":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "error":
                return <AlertCircle className="h-5 w-5 text-red-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isDragActive
                    ? "border-blue-400 bg-neutral-800"
                    : "border-neutral-600 hover:border-blue-500 hover:bg-neutral-900"
                    }`}
            >
                <input {...getInputProps()} />
                <motion.div
                    className="p-8 text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Upload
                        className={`h-12 w-12 mx-auto mb-4 ${isDragActive ? "text-blue-400" : "text-neutral-500"
                            }`}
                    />
                    <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                        {isDragActive
                            ? "Drop files here"
                            : "Upload your documents"}
                    </h3>
                    <p className="text-neutral-400 mb-4">
                        Drag and drop your resume, LinkedIn profile, or career documents here
                    </p>
                    <div className="text-sm text-neutral-500">
                        Supported formats: PDF, DOCX, TXT, MD (max 10MB)
                    </div>
                </motion.div>
            </div>

            {/* Uploaded list */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-neutral-100">
                        Uploaded Files
                    </h4>
                    {uploadedFiles.map((uf, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg"
                        >
                            <div className="flex items-center space-x-3">
                                {getFileIcon(uf.file.name)}
                                <div>
                                    <p className="font-medium text-neutral-100">
                                        {uf.file.name}
                                    </p>
                                    <p className="text-sm text-neutral-400">
                                        {(uf.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    {uf.status === "processing" && (
                                        <p className="text-sm text-blue-300">
                                            Processing with AI...
                                        </p>
                                    )}
                                    {uf.status === "error" && uf.error && (
                                        <p className="text-sm text-red-500">
                                            {uf.error}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(uf.status)}
                                <button
                                    onClick={() => removeFile(idx)}
                                    className="p-1 hover:bg-neutral-700 rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4 text-neutral-400" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Tips */}
            <div className="bg-neutral-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2 space-x-2">
                    📋 What to upload:
                </h4>
                <ul className="text-sm text-neutral-200 space-y-1">
                    <li>• Current resume (PDF or DOCX)</li>
                    <li>• LinkedIn profile export</li>
                    <li>• Cover letters with career history</li>
                    <li>• Any document containing your professional information</li>
                </ul>
            </div>
        </div>
    );
};

export default FileUpload;
