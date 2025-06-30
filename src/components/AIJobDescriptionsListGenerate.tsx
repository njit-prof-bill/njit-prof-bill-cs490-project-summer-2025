"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { collection, query, orderBy, getDocs, DocumentData, doc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

import AIJobDescriptionPreview from "./AIJobDescriptionPreview";

interface JobDescription {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  extractedAt: string;
  createdAt: any;
}

interface AIJobDescriptionsListGenerateProps {
  selectedJob?: JobDescription | null;
  onJobSelect?: (job: JobDescription | null) => void;
}

export default function AIJobDescriptionsListGenerate({ 
  selectedJob: externalSelectedJob, 
  onJobSelect
}: AIJobDescriptionsListGenerateProps) {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [internalSelectedJob, setInternalSelectedJob] = useState<JobDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  // Use external selectedJob if provided, otherwise use internal state
  const selectedJob = externalSelectedJob !== undefined ? externalSelectedJob : internalSelectedJob;

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

  const handleJobSelect = (job: JobDescription) => {
    if (onJobSelect) {
      onJobSelect(job);
    } else {
      setInternalSelectedJob(job);
    }
  };

  const handleDelete = async (jobId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevent triggering the card click
    }

    if (!user?.uid) {
      setError("You must be signed in to delete job descriptions.");
      return;
    }

    const jobToDelete = jobDescriptions.find(job => job.id === jobId);
    const confirmMessage = jobToDelete 
      ? `Are you sure you want to delete "${jobToDelete.jobTitle}" at ${jobToDelete.companyName}?`
      : "Are you sure you want to delete this job description?";

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setDeletingId(jobId);
      
      const jobDocRef = doc(
        firestore,
        "users",
        user.uid,
        "userJobDescriptions",
        jobId
      );

      await deleteDoc(jobDocRef);

      // Remove from local state
      setJobDescriptions(prev => prev.filter(job => job.id !== jobId));
      
      // Clear selection if the deleted job was selected
      if (selectedJob?.id === jobId) {
        if (onJobSelect) {
          onJobSelect(null);
        } else {
          setInternalSelectedJob(null);
        }
      }

    } catch (err) {
      console.error("Error deleting job description:", err);
      setError("Failed to delete job description.");
    } finally {
      setDeletingId(null);
    }
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
    <div className="w-full px-0 pb-0 h-full">
      
      {/* Grid: 2/5 for list, 3/5 for preview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 h-full">

        {/* Left side - Job List (2/5 width) */}
        <div className="lg:col-span-2 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold">
              Job Descriptions ({jobDescriptions.length})
            </h2>
            <button
              onClick={fetchJobDescriptions}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium transition"
            >
              Refresh
            </button>
          </div>

          {/* Scrollable List Container with fixed height */}
          <div
            className="flex-1 overflow-y-auto pr-2"
            style={{
              maxHeight: '60vh', // fixed height for scrolling
              scrollbarWidth: 'thin',
              scrollbarColor: '#52525b #27272a'
            }}
          >
            {/* Custom scrollbar styles for Webkit browsers */}
            <style jsx>{`
              .scrollbar-thin::-webkit-scrollbar {
                width: 6px;
              }
              .scrollbar-thin::-webkit-scrollbar-track {
                background: #27272a;
                border-radius: 3px;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb {
                background: #52525b;
                border-radius: 3px;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background: #71717a;
              }
            `}</style>
            <div className="space-y-2 scrollbar-thin">
              {jobDescriptions.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleJobSelect(job)}
                  className={`bg-zinc-900 border rounded-lg p-3 cursor-pointer transition-all hover:border-zinc-600 ${
                    selectedJob?.id === job.id ? 'border-orange-600 bg-zinc-800' : 'border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-start space-x-3">
                    <div className="flex-1 space-y-2 min-w-0">
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
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(job.id, e)}
                      disabled={deletingId === job.id}
                      className="flex-shrink-0 p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
                      title="Delete job description"
                    >
                      {deletingId === job.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Job Details */}
        <div className="lg:col-span-3 lg:sticky lg:top-4 lg:self-start">
          <AIJobDescriptionPreview 
            selectedJob={selectedJob} 
            onDelete={handleDelete}
            isDeletingFromPreview={deletingId === selectedJob?.id}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}