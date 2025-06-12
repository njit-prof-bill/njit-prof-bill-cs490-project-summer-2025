"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useRef } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import SubmissionFeedback from "@/components/SubmissionFeedback";

export default function HomePage() {
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

  const handleUploadAfterPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSubmissionStatus({ type: "error", message: "No file selected." });
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

      const res = await fetch("/api/history/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

        let data;
        try {
        data = await res.json();
        } catch {
        throw new Error("Invalid server response");
        }

      setSubmissionStatus({
        type: res.ok ? "success" : "error",
        message: data.message || (res.ok ? "Success" : "Upload failed."),
      });
    } catch (err) {
      console.error("Upload error:", err);
      setSubmissionStatus({ type: "error", message: "Unexpected error." });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
            <CardDescription>Click below to upload a .docx resume file.</CardDescription>
                <input
                id="docx-upload"
                type="file"
                accept=".docx"
                onChange={(e) => {
                    handleUploadAfterPick(e);
                    if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // clears the input after use
                    }
                }}
                ref={fileInputRef}
                className="hidden"
                />


            <label htmlFor="docx-upload" className="cursor-pointer">
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

      <Card className="w-full max-w-md shadow-lg mt-6">
        <CardHeader>
          <CardTitle>Placeholder: For resume generator</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <img src="/resume-page-example.jpg" alt="Example" />
            <img src="/resume-page-example-2.jpg" alt="Example" />
          </CardDescription>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}
