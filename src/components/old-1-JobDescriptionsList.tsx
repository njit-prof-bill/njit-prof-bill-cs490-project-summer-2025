"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { collection, query, orderBy, getDocs, DocumentData } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface JobDescription {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  extractedAt: string;
  createdAt: any;
}

export default function JobDescriptionsList() {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const fetchJobDescriptions = async () => {
    if (!user?.uid) {
      setError("You must be signed in to view job descriptions.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userJobDescriptionsRef = collection(
        firestore,
        "users",
        user.uid,
        "userJobDescriptions"
      );

      // Query documents ordered by creation date (newest first)
      const q = query(userJobDescriptionsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const descriptions: JobDescription[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        descriptions.push({
          id: doc.id,
          jobTitle: data.jobTitle || "Not specified",
          companyName: data.companyName || "Not specified",
          jobDescription: data.jobDescription || "",
          extractedAt: data.extractedAt || "",
          createdAt: data.createdAt,
        });
      });

      setJobDescriptions(descriptions);
    } catch (err) {
      console.error("Error fetching job descriptions:", err);
      setError("Failed to load job descriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDescriptions();
  }, [user?.uid]);

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date not available";
    }
  };

  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="w-full px-0 pb-0">
        <div className="flex justify-center items-center py-8">
          <div className="text-zinc-400">Loading job descriptions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-0 pb-0">
        <div className="text-red-500 text-center py-4">{error}</div>
      </div>
    );
  }

  if (jobDescriptions.length === 0) {
    return (
      <div className="w-full px-0 pb-0">
        <div className="text-zinc-400 text-center py-8">
          No job descriptions found. Upload your first job description to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-0 pb-0">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6 px-10">
          <h2 className="text-xl font-semibold text-white">
            Saved Job Descriptions ({jobDescriptions.length})
          </h2>
          <button
            onClick={fetchJobDescriptions}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium transition"
          >
            Refresh
          </button>
        </div>

        {jobDescriptions.map((job) => (
          <div
            key={job.id}
            className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 hover:border-zinc-600 transition-colors"
          >
            <div className="space-y-3">
              {/* Header with Company and Job Title */}
              <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-semibold text-white">
                  {job.jobTitle}
                </h3>
                <p className="text-orange-600 font-medium">
                  {job.companyName}
                </p>
              </div>

              {/* Job Description */}
              <div className="text-zinc-300 text-sm leading-relaxed">
                {truncateText(job.jobDescription)}
              </div>

              {/* Footer with timestamp */}
              {/* <div className="flex justify-between items-center pt-3 border-t border-zinc-700">
                
                <span className="text-xs text-zinc-500">
                  Extracted: {formatDate(job.extractedAt)}
                </span>
                <div className="text-xs text-zinc-500">
                  ID: {job.id.substring(0, 8)}...
                </div>
                
              </div> */}
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}