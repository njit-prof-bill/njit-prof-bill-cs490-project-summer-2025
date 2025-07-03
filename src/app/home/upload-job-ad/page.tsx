"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { jobAdAIPrompt, getAIResponse, AIParseJobAdJSON, parseJobAdJSONPrompt } from "@/components/ai/aiPrompt";
import { v4 as uuidv4 } from "uuid";

type JobAdEntry = {
  jobID: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  dateSubmitted: Timestamp;
};

export default function UploadJobAdPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | "success" | "error">(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // Redirect if not authenticated
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setSubmitted(null);

    try {
      // Use Gemini AI to extract structured info
      const aiResponse = await AIParseJobAdJSON(parseJobAdJSONPrompt, jobDescription);
      if (!aiResponse) {
        throw new Error("AI returned empty response when parsing job ad");
      }
      console.log(aiResponse);
      // const aiResponse = await getAIResponse(jobAdAIPrompt + "\n\nJob Ad:\n", jobDescription);
      const { companyName, jobTitle, jobDescription: desc } = JSON.parse(aiResponse);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let jobAds = [];
      if (userSnap.exists() && Array.isArray(userSnap.data().jobAds)) {
        jobAds = userSnap.data().jobAds;
      }
      const newJobAd = {
        jobID: uuidv4(), // Generate a unique ID
        companyName,
        jobTitle,
        jobDescription: desc,
        dateSubmitted: Timestamp.now(),
      };
      const newList = [...jobAds, newJobAd];
      await updateDoc(userRef, { jobAds: newList });

      setSubmitted("success");
      setJobDescription("");
    } catch (error) {
      setSubmitted("error");
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitted(null), 3000);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white dark:bg-stone-900 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Upload Job Ad</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="jobDescription" className="block mb-2 font-medium">
          Paste the job description below:
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          rows={10}
          className="w-full p-2 border rounded mb-4 text-black"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          required
          disabled={submitting}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? "Uploading..." : "Upload"}
        </button>
      </form>
      {submitting && <div className="mt-4 text-blue-600">Uploading...</div>}
      {submitted === "success" && (
        <div className="mt-4 text-green-600">Upload successful!</div>
      )}
      {submitted === "error" && (
        <div className="mt-4 text-red-600">Failed to upload. Please try again.</div>
      )}
    </div>
  );
}