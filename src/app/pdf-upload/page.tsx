"use client";

import BaseLayout from "@/components/BaseLayout";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import SubmissionFeedback from "@/components/SubmissionFeedback";

export default function PDFUploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    null | { type: "success" | "error"; message: string }
  >(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      setSubmissionStatus({
        type: "error",
        message: "Please select a valid PDF file.",
      });
      return;
    }

    setUploading(true);
    setSubmissionStatus(null);

    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const token = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/history/upload-pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      setSubmissionStatus({
        type: res.ok ? "success" : "error",
        message: data.message || (res.ok ? "Upload successful!" : "Upload failed."),
      });
    } catch (err) {
      console.error("Upload error:", err);
      setSubmissionStatus({
        type: "error",
        message: "Unexpected error occurred.",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <BaseLayout
      leftContent={<div>Left Sidebar</div>}
      middleContent={
        <div className="flex flex-col items-center">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle>Upload Your PDF Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription>Click below to upload a <strong>.pdf</strong> resume file.</CardDescription>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  {uploading ? "Uploading..." : "Select and Upload"}
                </div>
              </label>
              {submissionStatus && (
                <SubmissionFeedback
                  type={submissionStatus.type}
                  message={submissionStatus.message}
                />
              )}
            </CardContent>
            <CardFooter />
          </Card>
        </div>
      }
      rightContent={<div>Right Sidebar</div>}
    />
  );
}
