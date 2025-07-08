"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface JobDescription {
  id: string;
  appliedTo: boolean;
  applicationTime: Timestamp | any | null;
  applicationResumeId: string | null;
  companyName: string;
  createdAt: Timestamp | any;
  extractedAt: string;
  jobTitle: string;
  jobDescription: string;
  originalText: string;
}

interface Resume {
  id: string;
  companyName: string;
  createdAt: string;
  generatedAt: string;
  isFavorite: boolean;
  jobId: string;
  jobTitle: string;
  metadata: {
    completionTokens: number;
    model: string;
    promptTokens: number;
    totalTokens: number;
  };
  resumeContent: string;
  status: string;
  tags: string[];
}

export default function JobListings() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isUnapplying, setIsUnapplying] = useState(false);
  const { user } = useAuth();

  // Fetch job descriptions and resumes from API
  useEffect(() => {
    const fetchJobApplications = async () => {
      if (!user) return;
      
      try {
        // Get the Firebase Auth token
        const idToken = await user.getIdToken();
        
        const response = await fetch('/api/get-jobApplications', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setJobs(data.jobs || []);
          setResumes(data.resumes || []);
        } else {
          console.error('API returned error:', data.error);
        }
      } catch (error) {
        console.error("Error fetching job applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobApplications();
  }, [user]);

  // Fetch resumes when modal opens (now uses the cached resumes from initial load)
  const fetchResumes = async () => {
    if (!selectedJob) return;
    
    // Sort resumes: matching job ID first, then by creation date (most recent first)
    const sortedResumes = resumes.sort((a, b) => {
      // First priority: matching job ID
      const aMatches = a.jobId === selectedJob.id;
      const bMatches = b.jobId === selectedJob.id;
      
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      
      // Second priority: creation date (most recent first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    setResumes(sortedResumes);
  };

  const handleJobClick = (job: JobDescription) => {
    setSelectedJob(job);
  };

  const handleApplyResumeClick = () => {
    setShowModal(true);
    fetchResumes();
  };

  const handleResumeSelect = (resume: Resume) => {
    setSelectedResume(resume);
    setShowResumePreview(true);
  };

  const handleApplyResume = async () => {
    if (!selectedJob || !selectedResume || !user?.uid) return;

    setIsApplying(true);
    try {
      const jobRef = doc(firestore, "users", user.uid, "userJobDescriptions", selectedJob.id);
      await updateDoc(jobRef, {
        appliedTo: true,
        applicationTime: Timestamp.now(),
        applicationResumeId: selectedResume.id
      });

      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === selectedJob.id 
            ? { ...job, appliedTo: true, applicationTime: Timestamp.now(), applicationResumeId: selectedResume.id }
            : job
        )
      );

      // Close modals and reset state
      setShowModal(false);
      setShowResumePreview(false);
      setSelectedResume(null);
      setSelectedJob(null);
      
      alert("Resume applied successfully!");
    } catch (error) {
      console.error("Error applying resume:", error);
      alert("Error applying resume. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleUnapplyResume = async () => {
    if (!selectedJob || !user?.uid) return;

    setIsUnapplying(true);
    try {
      const jobRef = doc(firestore, "users", user.uid, "userJobDescriptions", selectedJob.id);
      await updateDoc(jobRef, {
        appliedTo: false,
        applicationTime: null,
        applicationResumeId: null
      });

      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === selectedJob.id 
            ? { ...job, appliedTo: false, applicationTime: null, applicationResumeId: null }
            : job
        )
      );

      // Update selected job state
      setSelectedJob(prev => prev ? { ...prev, appliedTo: false, applicationTime: null, applicationResumeId: null } : null);
      
      alert("Resume unapplied successfully!");
    } catch (error) {
      console.error("Error unapplying resume:", error);
      alert("Error unapplying resume. Please try again.");
    } finally {
      setIsUnapplying(false);
    }
  };

  const formatDate = (timestamp: Timestamp | any) => {
    // Handle both Firestore Timestamp objects and serialized timestamps from API
    if (timestamp && typeof timestamp === 'object') {
      if (timestamp.toDate) {
        // This is a Firestore Timestamp object
        return timestamp.toDate().toLocaleDateString();
      } else if (timestamp._seconds) {
        // This is a serialized timestamp from Firebase Admin SDK
        return new Date(timestamp._seconds * 1000).toLocaleDateString();
      }
    }
    return 'N/A';
  };

  const closeModal = () => {
    setShowModal(false);
    setShowResumePreview(false);
    setSelectedResume(null);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-white text-lg">Loading job descriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex gap-6">
        {/* Job List */}
        <div className="w-1/2 flex flex-col h-[calc(100vh-8rem)]">
          <h2 className="text-2xl font-bold mb-4 text-white">Job Descriptions</h2>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobClick(job)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedJob?.id === job.id
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white">{job.jobTitle || 'Untitled Job'}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      job.appliedTo ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {job.appliedTo ? 'Applied' : 'Not Applied'}
                    </span>
                  </div>
                  <p className="text-zinc-300">{job.companyName}</p>
                  <p className="text-sm text-zinc-400">Created: {formatDate(job.createdAt)}</p>
                  <p className="text-sm text-zinc-400">Extracted: {job.extractedAt}</p>
                  {job.appliedTo && job.applicationTime && (
                    <p className="text-sm text-green-400">
                      Applied: {formatDate(job.applicationTime)}
                    </p>
                  )}
                  {/* Resume ID Tag */}
                  {job.appliedTo && job.applicationResumeId && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-zinc-400">Resume ID:</span>
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-mono">
                        {job.applicationResumeId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Preview */}
        <div className="w-1/2 flex flex-col h-[calc(100vh-8rem)]">
          {selectedJob ? (
            <div className="bg-zinc-800 rounded-lg p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedJob.jobTitle}</h3>
                  <p className="text-xl text-zinc-300 mb-2">{selectedJob.companyName}</p>
                </div>
                <div className="flex gap-2">
                  {selectedJob.appliedTo ? (
                    <button
                      onClick={handleUnapplyResume}
                      disabled={isUnapplying}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition disabled:opacity-50"
                    >
                      {isUnapplying ? 'Unapplying...' : 'Unapply Resume'}
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyResumeClick}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-semibold transition"
                    >
                      Apply Resume To
                    </button>
                  )}
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none overflow-y-auto flex-1">
                <div className="whitespace-pre-wrap text-zinc-200">
                  {selectedJob.jobDescription}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800 rounded-lg p-6 text-center text-zinc-400 h-full flex items-center justify-center">
              Select a job to view details
            </div>
          )}
        </div>
      </div>

      {/* Resume Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex">
              {/* Resume List */}
              <div className="w-1/2 p-6 border-r border-zinc-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Select Resume</h3>
                  <button
                    onClick={closeModal}
                    className="text-zinc-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      onClick={() => handleResumeSelect(resume)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedResume?.id === resume.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{resume.jobTitle}</h4>
                        {resume.jobId === selectedJob?.id && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                            Job Match
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-300">{resume.companyName}</p>
                      <p className="text-sm text-zinc-400">Status: {resume.status}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resume.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-zinc-700 text-xs rounded text-zinc-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resume Preview */}
              <div className="w-1/2 p-6">
                {selectedResume ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">Resume Preview</h3>
                      <button
                        onClick={handleApplyResume}
                        disabled={isApplying}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-semibold transition disabled:opacity-50"
                      >
                        {isApplying ? 'Applying...' : 'Apply Resume'}
                      </button>
                    </div>
                    
                    <div className="bg-zinc-800 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2">{selectedResume.jobTitle}</h4>
                        <p className="text-zinc-300 mb-2">{selectedResume.companyName}</p>
                        <p className="text-sm text-zinc-400">Generated: {selectedResume.generatedAt}</p>
                      </div>
                      
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-zinc-200 text-sm">
                          {selectedResume.resumeContent}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-zinc-400 mt-20">
                    Select a resume to preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}