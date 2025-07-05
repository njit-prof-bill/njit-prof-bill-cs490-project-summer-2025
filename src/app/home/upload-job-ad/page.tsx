"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { jobAdAIPrompt, getAIResponse, AIParseJobAdJSON, parseJobAdJSONPrompt } from "@/components/ai/aiPrompt";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Wand2,
  Building
} from "lucide-react";

type JobAdEntry = {
  jobID: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  dateSubmitted: Timestamp;
  applied: boolean;
};

export default function UploadJobAdPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | "success" | "error">(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
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
      const newJobAd: JobAdEntry = {
        jobID: uuidv4(), // Generate a unique ID
        companyName,
        jobTitle,
        jobDescription: desc,
        dateSubmitted: Timestamp.now(),
        applied: false,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Upload Job Advertisement
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Paste a job description to automatically extract company name, job title, and details
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Job Description
            </h2>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paste the job description below
            </label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              rows={12}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here. Our AI will automatically extract the company name, job title, and organize the details for you..."
              required
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{jobDescription.length} characters</span>
              <div className="flex items-center gap-1">
                <Wand2 className="h-3 w-3" />
                <span>AI-powered extraction</span>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {submitted === "success" && (
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Job ad uploaded successfully! The AI has extracted and organized the details.
              </span>
            </div>
          )}

          {submitted === "error" && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 dark:text-red-200 font-medium">
                Upload failed. Please check your connection and try again.
              </span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={submitting || !jobDescription.trim()}
              className={`px-8 py-3 font-medium flex items-center gap-2 ${
                submitting
                  ? "bg-gray-500 cursor-wait text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing with AI...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Job Ad
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}