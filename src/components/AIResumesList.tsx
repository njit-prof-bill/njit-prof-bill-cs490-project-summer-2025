"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { collection, query, orderBy, getDocs, DocumentData, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface AIResume {
  id: string;
  companyName: string;
  jobTitle: string;
  jobId: string;
  resumeContent: string;
  createdAt: string;
  generatedAt: string;
  status: string;
  isFavorite: boolean;
  tags: string[];
  userId: string;
  metadata: {
    completionTokens: number;
    model: string;
    promptTokens: number;
    totalTokens: number;
  };
}

interface AIResumesListProps {
  refreshTrigger?: number;
}

export default function AIResumesList({ refreshTrigger }: AIResumesListProps) {
  const [resumes, setResumes] = useState<AIResume[]>([]);
  const [selectedResume, setSelectedResume] = useState<AIResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'display'>('list');
  const { user } = useAuth();

  const fetchResumes = async () => {
    if (!user?.uid) {
      setError("You must be signed in to view resumes.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userResumesRef = collection(
        firestore,
        "users",
        user.uid,
        "userAIResumes"
      );

      // Query documents ordered by creation date (newest first)
      const q = query(userResumesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const resumesList: AIResume[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        resumesList.push({
          id: doc.id,
          companyName: data.companyName || "Unknown Company",
          jobTitle: data.jobTitle || "Unknown Position",
          jobId: data.jobId || "",
          resumeContent: data.resumeContent || "",
          createdAt: data.createdAt || "",
          generatedAt: data.generatedAt || "",
          status: data.status || "unknown",
          isFavorite: data.isFavorite || false,
          tags: data.tags || [],
          userId: data.userId || "",
          metadata: data.metadata || {
            completionTokens: 0,
            model: "",
            promptTokens: 0,
            totalTokens: 0
          }
        });
      });

      setResumes(resumesList);

      // Auto-select the most recent resume if available and no resume is currently selected
      if (resumesList.length > 0 && !selectedResume) {
        setSelectedResume(resumesList[0]);
      }
      
      // If we have a new resume and we're in display view, show the newest one
      if (resumesList.length > 0 && view === 'display') {
        setSelectedResume(resumesList[0]);
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setError("Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts or user changes
  useEffect(() => {
    fetchResumes();
  }, [user?.uid]);

  // Refresh when refreshTrigger prop changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchResumes();
    }
  }, [refreshTrigger]);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Date not available";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
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

  const handleResumeSelect = (resume: AIResume) => {
    setSelectedResume(resume);
    setView('display');
  };

  const handleBackToList = () => {
    setView('list');
  };

  const toggleFavorite = async (resumeId: string, currentFavoriteStatus: boolean, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!user?.uid) return;

    try {
      const resumeDocRef = doc(
        firestore,
        "users",
        user.uid,
        "userAIResumes",
        resumeId
      );

      await updateDoc(resumeDocRef, {
        isFavorite: !currentFavoriteStatus
      });

      // Update local state
      setResumes(prev => prev.map(resume => 
        resume.id === resumeId 
          ? { ...resume, isFavorite: !currentFavoriteStatus }
          : resume
      ));

      // Update selected resume if it's the one being toggled
      if (selectedResume?.id === resumeId) {
        setSelectedResume(prev => prev ? { ...prev, isFavorite: !currentFavoriteStatus } : null);
      }

    } catch (err) {
      console.error("Error updating favorite status:", err);
      setError("Failed to update favorite status.");
    }
  };

  const handleDelete = async (resumeId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!user?.uid) {
      setError("You must be signed in to delete resumes.");
      return;
    }

    const resumeToDelete = resumes.find(resume => resume.id === resumeId);
    const confirmMessage = resumeToDelete 
      ? `Are you sure you want to delete the resume for "${resumeToDelete.jobTitle}" at ${resumeToDelete.companyName}?`
      : "Are you sure you want to delete this resume?";

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setDeletingId(resumeId);
      
      const resumeDocRef = doc(
        firestore,
        "users",
        user.uid,
        "userAIResumes",
        resumeId
      );

      await deleteDoc(resumeDocRef);

      // Remove from local state
      setResumes(prev => prev.filter(resume => resume.id !== resumeId));
      
      // Clear selection if the deleted resume was selected
      if (selectedResume?.id === resumeId) {
        const remainingResumes = resumes.filter(resume => resume.id !== resumeId);
        setSelectedResume(remainingResumes.length > 0 ? remainingResumes[0] : null);
        if (remainingResumes.length === 0) {
          setView('list');
        }
      }

    } catch (err) {
      console.error("Error deleting resume:", err);
      setError("Failed to delete resume.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'text-green-500';
      case 'processing': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-zinc-500';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full max-h-full">
        <div className="flex justify-center items-center flex-1">
          <div className="text-zinc-400 flex items-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Loading resumes...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full max-h-full">
        <div className="text-red-500 text-center py-4 bg-red-950/20 border border-red-900/30 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-col h-full max-h-full">
        <div className="flex flex-col items-center justify-center flex-1">
          <svg className="w-16 h-16 text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">No resumes found</h3>
          <p className="text-zinc-500">Generate your first AI resume to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Header - Fixed */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          {view === 'display' && (
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 px-3 py-2 text-orange-600 hover:text-orange-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
          )}
          <h2 className="text-2xl font-bold text-white">
            {view === 'list' ? `AI Resumes (${resumes.length})` : `${selectedResume?.jobTitle} - ${selectedResume?.companyName}`}
          </h2>
        </div>
        
        {view === 'list' && (
          <button
            onClick={fetchResumes}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium transition"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 min-h-0">
        {view === 'list' ? (
          /* List View - Scrollable */
          <div className="h-full overflow-y-auto pr-2 -mr-2">
            <div className="grid gap-4 pb-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => handleResumeSelect(resume)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 cursor-pointer transition-all hover:border-zinc-600 hover:bg-zinc-800 flex-shrink-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {resume.jobTitle}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(resume.status)} bg-zinc-800`}>
                          {resume.status}
                        </span>
                        {resume.isFavorite && (
                          <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        )}
                      </div>
                      
                      <p className="text-orange-600 font-medium mb-2 truncate">
                        {resume.companyName}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-zinc-400 mb-2">
                        <span>Created: {formatDate(resume.createdAt)}</span>
                        {resume.generatedAt && (
                          <span>Generated: {formatDate(resume.generatedAt)}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        {resume.tags.map((tag, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="text-zinc-500 text-sm line-clamp-2">
                        {resume.resumeContent.substring(0, 150)}...
                      </p>

                      {resume.metadata.model && (
                        <p className="text-xs text-zinc-600 mt-2">
                          Model: {resume.metadata.model} • Tokens: {resume.metadata.totalTokens}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={(e) => toggleFavorite(resume.id, resume.isFavorite, e)}
                        className={`p-2 rounded transition-colors ${
                          resume.isFavorite 
                            ? 'text-yellow-500 hover:text-yellow-400' 
                            : 'text-zinc-500 hover:text-yellow-500'
                        }`}
                        title={resume.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <svg className="w-4 h-4" fill={resume.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>

                      <button
                        onClick={(e) => handleDelete(resume.id, e)}
                        disabled={deletingId === resume.id}
                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
                        title="Delete resume"
                      >
                        {deletingId === resume.id ? (
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
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Display View - Scrollable */
          <div className="h-full overflow-y-auto pr-2 -mr-2">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(selectedResume?.status || '')} bg-zinc-800`}>
                      {selectedResume?.status}
                    </span>
                    {selectedResume?.isFavorite && (
                      <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-400 mb-4">
                    <div>
                      <p>Created: {formatDate(selectedResume?.createdAt || '')}</p>
                      {selectedResume?.generatedAt && (
                        <p>Generated: {formatDate(selectedResume.generatedAt)}</p>
                      )}
                    </div>
                    <div>
                      <p>Model: {selectedResume?.metadata.model}</p>
                      <p>Total Tokens: {selectedResume?.metadata.totalTokens}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {selectedResume?.tags.map((tag, index) => (
                      <span key={index} className="text-sm px-3 py-1 bg-zinc-800 text-zinc-300 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={(e) => selectedResume && toggleFavorite(selectedResume.id, selectedResume.isFavorite, e)}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                      selectedResume?.isFavorite 
                        ? 'text-yellow-500 hover:text-yellow-400 hover:bg-yellow-950/20' 
                        : 'text-zinc-500 hover:text-yellow-500 hover:bg-yellow-950/20'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={selectedResume?.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {selectedResume?.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </button>

                  <button
                    onClick={(e) => selectedResume && handleDelete(selectedResume.id, e)}
                    disabled={deletingId === selectedResume?.id}
                    className="flex items-center gap-2 px-3 py-2 text-red-500 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors disabled:opacity-50"
                  >
                    {deletingId === selectedResume?.id ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-zinc-200 leading-relaxed border-t border-zinc-700 pt-6">
                  {selectedResume?.resumeContent}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}