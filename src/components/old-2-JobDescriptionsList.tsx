"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { collection, query, orderBy, getDocs, DocumentData } from "firebase/firestore";
import { firestore } from "@/lib/firebase";


import JobDescriptionPreview from "./JobDescriptionPreview";


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
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
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

  // Import the preview component at the top of the file
  // import JobDescriptionPreview from "./JobDescriptionPreview";

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Job List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Job Descriptions ({jobDescriptions.length})
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
              onClick={() => setSelectedJob(job)}
              className={`bg-zinc-900 border rounded-lg p-4 cursor-pointer transition-all hover:border-zinc-600 ${
                selectedJob?.id === job.id 
                  ? 'border-orange-600 bg-zinc-800' 
                  : 'border-zinc-700'
              }`}
            >
              <div className="space-y-2">
                {/* Job Title */}
                <h3 className="text-lg font-semibold text-white truncate">
                  {job.jobTitle}
                </h3>
                
                {/* Company Name */}
                <p className="text-orange-600 font-medium truncate">
                  {job.companyName}
                </p>

                {/* Timestamp */}
                <p className="text-xs text-zinc-500">
                  {formatDate(job.extractedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right side - Job Details */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <JobDescriptionPreview selectedJob={selectedJob} />
        </div>
      </div>
    </div>
  );
}