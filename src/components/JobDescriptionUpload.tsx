"use client";
import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface ExtractedJobData {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  timestamp: string;
}

interface JobDescriptionUploadProps {
  onJobAdded?: () => void; // Callback function to refresh the list
}

export default function JobDescriptionUpload({ onJobAdded }: JobDescriptionUploadProps) {
  const [jobText, setJobText] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!jobText.trim()) {
      setStatus("Please enter a job description.");
      return;
    }

    if (!user?.uid) {
      setStatus("You must be signed in.");
      return;
    }

    setIsSubmitting(true);
    try {
      setStatus("Processing job description...");

      // Send job text to Groq API for extraction
      const response = await fetch("/api/groq-jobDescExtract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobText }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const extractedData: ExtractedJobData = await response.json();

      // Store the extracted data in Firebase
      const userJobDescriptionsRef = collection(
        firestore,
        "users",
        user.uid,
        "userJobDescriptions"
      );

      await addDoc(userJobDescriptionsRef, {
        originalText: jobText,
        jobTitle: extractedData.jobTitle,
        companyName: extractedData.companyName,
        jobDescription: extractedData.jobDescription,
        extractedAt: extractedData.timestamp,
        createdAt: new Date(),
        appliedTo: false,
        applicationTime: null,
        applicationResumeId: null,
      });

      setStatus("Job description processed and saved successfully.");
      setJobText(""); // Clear the textarea after successful submission
      
      // Call the callback function to refresh the list
      if (onJobAdded) {
        onJobAdded();
      }
    } catch (err) {
      console.error("Error processing job description:", err);
      setStatus("Error processing job description. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-0 pb-0">
      <div className="flex flex-col gap-3 w-full">
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste or type the job ad here..."
          className="w-full p-3 rounded-md bg-zinc-900 text-white border border-zinc-700 resize-none h-72"
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : "Extract & Save Job Details"}
        </button>
        {status && (
          <p className={`text-sm ${status.includes("Error") ? "text-red-500" : "text-green-500"}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}