"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { db } from '@/lib/firebase'; // Adjust path as needed

interface JobDescription {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  extractedAt: string;
  createdAt: any;
}

interface UserData {
  // Define your user data structure here
  name?: string;
  email?: string;
  skills?: string[];
  experience?: string;
  // Add other relevant fields
}

interface AIJobDescriptionPreviewProps {
  selectedJob: JobDescription | null;
  onDelete?: (jobId: string) => void;
  isDeletingFromPreview?: boolean;
  onGenerationComplete?: (result: any) => void;
}

export default function AIJobDescriptionPreview({ 
  selectedJob, 
  onDelete, 
  isDeletingFromPreview = false,
  onGenerationComplete
}: AIJobDescriptionPreviewProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Initialize auth and listen for auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);
  
  const handleDelete = () => {
    if (!selectedJob || !onDelete) return;
    
    if (confirm(`Are you sure you want to delete "${selectedJob.jobTitle}" at ${selectedJob.companyName}?`)) {
      onDelete(selectedJob.id);
    }
  };

  const handleGenerate = async () => {
    if (!selectedJob || !user) {
      setGenerationError('Please ensure you are logged in and have selected a job.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Fetch user data from specific Firebase path: users/{uid}/userDocuments/categoryData
      const userDocRef = doc(db, 'users', user.uid, 'userDocuments', 'categoryData');
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        throw new Error('User profile data not found. Please complete your profile first.');
      }

      const userData = userDocSnap.data();

      // Get user's ID token for authentication
      const idToken = await user.getIdToken();

      // Send data to API route for Groq processing
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          jobData: selectedJob,
          userData: userData,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate resume');
      }

      const result = await response.json();
      
      // Call the completion callback if provided
      if (onGenerationComplete) {
        onGenerationComplete(result);
      }

    } catch (error) {
      console.error('Resume generation error:', error);
      setGenerationError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

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

  if (!selectedJob) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8">
        <div className="text-center text-zinc-400">
          <div className="mb-4">
            <svg 
              className="w-16 h-16 mx-auto text-zinc-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-500 mb-2">
            No Job Selected
          </h3>
          <p className="text-sm text-zinc-600">
            Click on a job from the list to view its details and generate a tailored resume
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-white">
              {selectedJob.jobTitle}
            </h2>
            <p className="text-orange-600 font-medium">
              {selectedJob.companyName}
            </p>
          </div>
          <div className="flex items-start space-x-3">
            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !user}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors flex items-center space-x-2"
              title={!user ? "Please log in to generate AI insights" : "Generate AI insights for this job"}
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Generating Resume...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Resume</span>
                </>
              )}
            </button>

            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeletingFromPreview}
                className="p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
                title="Delete job description"
              >
                {isDeletingFromPreview ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {generationError && (
        <div className="bg-red-900/20 border-b border-red-800 px-6 py-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm">{generationError}</p>
          </div>
        </div>
      )}

      {/* Job Description Content */}
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3">
              Job Description
            </h3>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {selectedJob.jobDescription}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-zinc-800 px-6 py-3 border-t border-zinc-700">
        <div className="text-right">
          <p className="text-xs text-zinc-500">
            Extracted
          </p>
          <p className="text-sm text-zinc-400">
            {formatDate(selectedJob.extractedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}