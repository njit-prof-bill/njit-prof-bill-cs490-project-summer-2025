"use client";

import { useState, useEffect } from "react";

type BioSubmissionProps = {
  bio: string;
  setBio: (val: string) => void;
  onSubmitSuccess?: (submittedBio: string) => void;
  showSubmitButton?: boolean;
};

export default function BioSubmission({
  bio,
  setBio,
  onSubmitSuccess,
  showSubmitButton = true,
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

  const MIN_LENGTH = 20;
  const MAX_LENGTH = 1000;

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
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStatus("success");
        onSubmitSuccess(trimmed);
      } catch {
        setStatus("error");
      }
    }
  };

  useEffect(() => {
    if (status !== "idle") {
      setStatus("idle");
    }
  }, [bio]);

  return (
    <div className="space-y-4 p-6 rounded-lg bg-gray-800 text-white shadow-md w-full max-w-5xl mx-auto">
      <h3 className="text-xl font-semibold mb-2">Biography</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="w-full"
      >
        <label className="block w-full">
          <span className="block mb-1">Tell us about yourself:</span>
          <textarea
            className="w-full bg-gray-700 text-white rounded p-3 border border-gray-600 focus:outline-none focus:bg-gray-600 resize-y text-base min-h-[220px] md:min-h-[320px] max-w-4xl mx-auto"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short biography about yourself..."
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
            onClick={handleSubmit}
            disabled={status === "submitting"}
            className={`px-3 py-2 text-white rounded ${
              status === "submitting"
                ? "bg-gray-500"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {status === "submitting" ? "Submitting..." : "Submit Bio"}
          </button>
        )}

        {status === "success" && (
          <p className="text-green-400">Biography submitted successfully!</p>
        )}
        {status === "error" && (
          <p className="text-red-400">Something went wrong. Please try again.</p>
        )}
        {status === "empty" && (
          <p className="text-red-400">Biography cannot be empty.</p>
        )}
        {status === "tooShort" && (
          <p className="text-red-400">
            Biography must be at least {MIN_LENGTH} characters.
          </p>
        )}
        {status === "tooLong" && (
          <p className="text-red-400">
            Biography must be less than {MAX_LENGTH} characters.
          </p>
        )}
        {status === "invalid" && (
          <p className="text-red-400">HTML tags are not allowed in your bio.</p>
        )}
      </form>
    </div>
  );
}
