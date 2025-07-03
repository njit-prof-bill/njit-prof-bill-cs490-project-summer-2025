"use client";

import { useState, useEffect } from "react";

type BioSubmissionProps = {
  bio: string;
  setBio: (val: string) => void;
  onSubmitSuccess?: (submittedBio: string) => void;
  showSubmitButton?: boolean;
  onUploadSuccess?: () => void; // NEW: callback to refresh resume list
};

export default function BioSubmission({
  bio,
  setBio,
  onSubmitSuccess,
  showSubmitButton = true,
  onUploadSuccess, // NEW
}: BioSubmissionProps) {
  const [status, setStatus] = useState<
    | "idle"
    | "submitting"
    | "success"
    | "error"
    | "empty"
    | "tooShort"
    | "tooLong"
    | "invalid"
  >("idle");
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const MIN_LENGTH = 20;
  const MAX_LENGTH = 10000;

  const containsHTMLTags = (input: string) => /<[^>]*>/g.test(input);

  const handleSubmit = async () => {
    const trimmed = bio.trim();

    if (!trimmed) {
      setStatus("empty");
      return;
    }
    if (trimmed.length < MIN_LENGTH) {
      setStatus("tooShort");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setStatus("tooLong");
      return;
    }
    if (containsHTMLTags(trimmed)) {
      setStatus("invalid");
      return;
    }

    if (onSubmitSuccess) {
      setStatus("submitting");
      setAiResult(null);
      setAiError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStatus("success");
        onSubmitSuccess(trimmed);
        // Parse the bio with AI after submission
        const res = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: trimmed }),
        });
        if (!res.ok) throw new Error('Failed to parse with AI');
        const data = await res.json();
        setAiResult(data);
        // Save bio and AI result to backend
        const saveRes = await fetch('/api/saveResume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            bio: trimmed,
            userId: typeof window !== 'undefined' ? localStorage.getItem('userId') : undefined,
            displayName: 'Bio Submission',
          }),
        });
        if (!saveRes.ok) throw new Error('Failed to save bio and AI result');
        // NEW: Call onUploadSuccess after successful save
        if (typeof onUploadSuccess === 'function') onUploadSuccess();
      } catch (err: any) {
        setStatus("error");
        setAiError(err.message || 'Error parsing with AI');
      }
    }
  };

  useEffect(() => {
    if (status !== "idle") {
      setStatus("idle");
    }
  }, [bio]);

  return (
    <div className="space-y-4 p-6 rounded-lg bg-gray-800 text-white shadow-md w-full max-w-7xl mx-auto">
      <h3 className="text-xl font-semibold mb-2">Your Professional Biography</h3>
      <p className="text-gray-300 mb-4 text-base">
        Please write a brief biography about yourself. This will help us understand your background, skills, and career goals. You can write or paste your story in your own words—no resume file needed. The system will analyze your biography to help build your resume.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="w-full"
      >
        <label className="block w-full">
          <span className="block mb-1">Tell us about your experience, education, and what makes you unique:</span>
          <textarea
            className="w-full bg-gray-700 text-white rounded p-3 border border-gray-600 focus:outline-none focus:bg-gray-600 resize-y text-base min-h-[220px] md:min-h-[320px] max-w-7xl mx-auto"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="E.g. 'I am a software developer with 5 years of experience in web development, passionate about building user-friendly applications. I graduated from XYZ University and have worked at ABC Corp, focusing on React and Node.js projects. My goal is to create impactful technology solutions.'"
            rows={12}
            style={{ fontSize: "1.1rem" }}
          />
        </label>

        <p
          className={`text-sm ${
            bio.length < MIN_LENGTH ? "text-red-400" : "text-gray-300"
          }`}
        >
          {bio.length} / {MAX_LENGTH} characters
        </p>

        {showSubmitButton && (
          <button
            type="button"
            className={`mt-4 px-6 py-2 rounded-lg font-semibold shadow transition-colors duration-150 ${status === "success" ? "bg-green-600 text-white" : status === "error" ? "bg-red-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
            onClick={handleSubmit}
            disabled={status === "submitting"}
            style={{ opacity: status === "submitting" ? 0.7 : 1 }}
          >
            {status === "submitting" ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Bio"
            )}
          </button>
        )}

        {/* Show status messages */}
        {status === "success" && (
          <div className="mt-2 text-green-600 dark:text-green-400 font-medium">Bio submitted successfully!</div>
        )}
        {status === "error" && (
          <div className="mt-2 text-red-600 dark:text-red-400 font-medium">Error submitting bio. Please try again.</div>
        )}
        {status === "empty" && (
          <div className="mt-2 text-red-500 dark:text-red-400">Bio cannot be empty.</div>
        )}
        {status === "tooShort" && (
          <div className="mt-2 text-red-500 dark:text-red-400">Bio is too short (min 20 characters).</div>
        )}
        {status === "tooLong" && (
          <div className="mt-2 text-red-500 dark:text-red-400">Bio is too long (max 10,000 characters).</div>
        )}
        {status === "invalid" && (
          <div className="mt-2 text-red-500 dark:text-red-400">Bio contains invalid HTML tags.</div>
        )}
      </form>
    </div>
  );
}
