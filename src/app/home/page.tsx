"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import SubmissionFeedback from "@/components/SubmissionFeedback";
import LoadingLayout from "@/components/LoadingLayout";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [submissionStatus, setSubmissionStatus] = useState<null | { type: "success" | "error"; message: string }>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // Redirect to landing page if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingLayout />;
  }

  const handleSubmit = () => {
    // Simulate a submission
    const success = Math.random() > 0.5; // randomly pass/fail

    if (success) {
      setSubmissionStatus({ type: "success", message: "Submission successful!" });
    } else {
      setSubmissionStatus({ type: "error", message: "Submission failed. Please try again." });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Marcus App Template</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            This app is a starter template for SaaS applications. To use this template, simply fork the repository and install the app dependencies.
          </CardDescription>

          <button
            onClick={handleSubmit}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Submit
          </button>

          {submissionStatus && (
            <div className="mt-4">
              <SubmissionFeedback
                type={submissionStatus.type}
                message={submissionStatus.message}
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <CardDescription>Copyright 2025 Fourier Gauss Labs</CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
