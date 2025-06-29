"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { collection, query, orderBy, getDocs, DocumentData, doc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface AIResume {
  id: string;
  title?: string;
  content: string;
  createdAt: any;
  updatedAt?: any;
}

export default function AIResumesList() {
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
          title: data.title || `Resume ${doc.id.slice(0, 8)}`,
          content: data.content || "",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      setResumes(resumesList);

      // Auto-select the most recent resume if available
      if (resumesList.length > 0 && !selectedResume) {
        setSelectedResume(resumesList[0]);
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setError("Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user?.uid]);

  const formatDate = (timestamp: any) => {
    try {
      let date;
      if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else if (timestamp?.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      
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
      ? `Are you sure you want to delete "${resumeToDelete.title}"?`
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

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center py-8">
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
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-red-500 text-center py-4 bg-red-950/20 border border-red-900/30 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-zinc-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">No resumes found</h3>
          <p className="text-zinc-500">Generate your first AI resume to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
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
            {view === 'list' ? `AI Resumes (${resumes.length})` : selectedResume?.title}
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

      {view === 'list' ? (
        /* List View */
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              onClick={() => handleResumeSelect(resume)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 cursor-pointer transition-all hover:border-zinc-600 hover:bg-zinc-800"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate">
                    {resume.title}
                  </h3>
                  <p className="text-zinc-400 text-sm mb-2">
                    Created: {formatDate(resume.createdAt)}
                  </p>
                  <p className="text-zinc-500 text-sm line-clamp-2">
                    {resume.content.substring(0, 150)}...
                  </p>
                </div>
                
                <button
                  onClick={(e) => handleDelete(resume.id, e)}
                  disabled={deletingId === resume.id}
                  className="flex-shrink-0 ml-4 p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
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
          ))}
        </div>
      ) : (
        /* Display View */
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1">
                Created: {formatDate(selectedResume?.createdAt)}
              </p>
              {selectedResume?.updatedAt && (
                <p className="text-zinc-500 text-xs">
                  Updated: {formatDate(selectedResume.updatedAt)}
                </p>
              )}
            </div>
            
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

          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-zinc-200 leading-relaxed">
              {selectedResume?.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}