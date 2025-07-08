"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
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

interface GenerateResumeButtonProps {
  selectedJob: JobDescription | null;
  onGenerationComplete?: (result: any) => void;
  onGenerationStart?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function GenerateResumeButton({ 
  selectedJob,
  onGenerationComplete,
  onGenerationStart,
  className = "",
  size = 'md',
  variant = 'primary'
}: GenerateResumeButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Initialize auth and listen for auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleGenerate = async () => {
    if (!selectedJob || !user) {
      setGenerationError('Please ensure you are logged in and have selected a job.');
      return;
    }

    setIsGenerating(true);
    setShowSuccess(false);
    setGenerationError(null);
    
    // Call the optional start callback
    if (onGenerationStart) {
      onGenerationStart();
    }

    try {
      // Fetch user data from specific Firebase path: users/{uid}/userDocuments/categoryData
      const userDocRef = doc(db, 'users', user.uid, 'userDocuments', 'categoryData');
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        throw new Error('User profile data not found. Please complete your profile first.');
      }

      const categoryData = userDocSnap.data();
      
      // Extract only the groqResponse key from the document
      const groqResponse = categoryData?.groqResponse;
      
      if (!groqResponse) {
        throw new Error('User profile data (groqResponse) not found. Please complete your profile first.');
      }

      // Send only the groqResponse data to API route for Groq processing
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobData: selectedJob,
          userData: groqResponse, // Only sending the groqResponse content
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate resume');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Store the generated resume in Firebase: users/{uid}/userAIResumes
        const userAIResumesRef = collection(db, 'users', user.uid, 'userAIResumes');
        
        const resumeDocument = {
          resumeContent: result.data.resumeContent,
          jobTitle: result.data.jobTitle,
          companyName: result.data.companyName,
          jobId: result.data.jobId,
          jobDesc: result.data.jobDesc, // Add the job description string to the document
          generatedAt: result.data.generatedAt,
          userId: result.data.userId,
          metadata: result.data.metadata,
          // Additional fields for better organization
          status: 'generated',
          isFavorite: false,
          tags: [result.data.jobTitle, result.data.companyName],
          createdAt: new Date().toISOString(),
        };

        // Add the document to Firestore
        const docRef = await addDoc(userAIResumesRef, resumeDocument);
        
        // Update the result with the Firestore document ID
        const finalResult = {
          ...result,
          data: {
            ...result.data,
            resumeId: docRef.id,
            firestorePath: `users/${user.uid}/userAIResumes/${docRef.id}`,
          }
        };

        console.log('Resume saved to Firebase with ID:', docRef.id);
        
        // Show success state before completing
        setIsGenerating(false);
        setShowSuccess(true);
        
        // Hide success state after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
        
        // Call the completion callback if provided
        if (onGenerationComplete) {
          onGenerationComplete(finalResult);
        }
      } else {
        throw new Error('Failed to generate resume - invalid response format');
      }

    } catch (error) {
      console.error('Resume generation error:', error);
      setGenerationError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsGenerating(false);
      setShowSuccess(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white',
    secondary: 'bg-zinc-600 hover:bg-zinc-700 disabled:bg-zinc-800 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white disabled:border-blue-800 disabled:text-blue-800'
  };

  // Success variant classes
  const successClasses = 'bg-green-600 text-white';

  // Determine if button should be disabled
  const isDisabled = isGenerating || !user || !selectedJob || showSuccess;

  // Get button text based on state
  const getButtonText = () => {
    if (showSuccess) return 'Resume Done Generating';
    if (!user) return 'Login Required';
    if (!selectedJob) return 'Select Job First';
    if (isGenerating) return 'Generating Resume...';
    return 'Generate Resume';
  };

  // Get tooltip text
  const getTooltipText = () => {
    if (showSuccess) return 'Resume generation completed successfully!';
    if (!user) return 'Please log in to generate a tailored resume';
    if (!selectedJob) return 'Please select a job from the list first';
    return `Generate a resume tailored to ${selectedJob?.jobTitle} at ${selectedJob?.companyName}`;
  };

  // Get button classes based on state
  const getButtonClasses = () => {
    if (showSuccess) return successClasses;
    return variantClasses[variant];
  };

  // Get icon based on state
  const getIcon = () => {
    if (showSuccess) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    
    if (isGenerating) {
      return (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleGenerate}
        disabled={isDisabled}
        className={`
          ${sizeClasses[size]} 
          ${getButtonClasses()} 
          disabled:opacity-50 
          font-medium 
          rounded 
          transition-colors 
          flex 
          items-center 
          space-x-2
          ${className}
        `}
        title={getTooltipText()}
      >
        {getIcon()}
        <span>{getButtonText()}</span>
      </button>

      {/* Error Display */}
      {generationError && (
        <div className="flex items-center space-x-2 text-red-400 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{generationError}</span>
        </div>
      )}
    </div>
  );
}