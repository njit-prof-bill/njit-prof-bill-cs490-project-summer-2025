import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

import AIJobDescriptionsListGenerate from "@/components/AIJobDescriptionsListGenerate";
import GenerateResumeButton from '@/components/GenerateResumeButton';

import AIResumesList from '@/components/AIResumesList';

import { useState, useEffect } from "react";

// Match the interface from your existing components
interface JobDescription {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  extractedAt: string;
  createdAt: any;
}

interface GenerationResult {
  success: boolean;
  data?: any;
  error?: string;
  // Define based on what your generation function returns
}

export default function GenerateCard() {
    const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showJobDescriptions, setShowJobDescriptions] = useState(true);


    // ------------------------------------------------
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger
    // ------------------------------------------------


    const handleGenerationComplete = (result: GenerationResult) => {
        console.log('Resume generated:', result);
        setIsGenerating(false);
        

// ---------------------------------------------
        // Trigger refresh of the resumes list when generation is successful
        if (result.success) {
            setRefreshTrigger(prev => prev + 1);
        }
// ----------------------------------------------


    };

    const handleJobSelect = (job: JobDescription | null) => {
        setSelectedJob(job);
    };

    const handleGenerate = async () => {
        if (!selectedJob) return;
        
        setIsGenerating(true);
        // Your generation logic here
        // Then call handleGenerationComplete when done
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Header section - fixed height */}
            <div className="flex-shrink-0">
                <h2 className="text-2xl font-bold mb-4">
                    <GenerateResumeButton 
                        selectedJob={selectedJob}
                        onGenerationComplete={handleGenerationComplete}
                        size="lg"
                        variant="primary"
                        className="w-64 mx-auto"
                        // className="w-full"
                    />
                </h2>

                {/* Toggle Button - positioned above the content */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setShowJobDescriptions(!showJobDescriptions)}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white rounded-lg transition-colors duration-200 shadow-sm"
                        title={showJobDescriptions ? "Hide Job Descriptions" : "Show Job Descriptions"}
                    >
                        <span className="text-sm font-medium">
                            {showJobDescriptions ? "Hide Jobs" : "Show Jobs"}
                        </span>
                        <svg 
                            className={`w-4 h-4 transform transition-transform duration-200 ${showJobDescriptions ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main content area - flexible height */}
            <div className="flex-1 flex flex-row w-full min-h-0">
                <div className="flex w-full h-full transition-all duration-300 ease-in-out">
                    {/* Left div - expands when right div is hidden */}
                    <div className={`p-0.5 p-1 transition-all duration-300 ease-in-out h-full ${
                        showJobDescriptions ? 'flex-1' : 'flex-[3]'
                    }`}>
                        {/* --------------------Component for Displaying Generated Resume HERE: ------------*/}
                        {/* <img src="/resume-page-example-2.jpg" alt="Fetched Image" />   */}
                        <AIResumesList refreshTrigger={refreshTrigger} />
                        {/* ----------------------------------------------------------------------- */}
                    </div>

                    {/* Right div - collapses/expands based on state */}
                    {/* <div className={`p-0.5 p-1 transition-all duration-300 ease-in-out overflow-hidden h-full */}
                    <div className={`p-0.5 p-1 transition-all duration-300 ease-in-out h-full ${
                        showJobDescriptions 
                            ? 'flex-1 opacity-100' 
                            : 'flex-0 w-0 opacity-0 pointer-events-none'
                    }`}>
                        {showJobDescriptions && (
                            <div className="h-full">
                                <AIJobDescriptionsListGenerate 
                                    selectedJob={selectedJob}
                                    onJobSelect={handleJobSelect}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}