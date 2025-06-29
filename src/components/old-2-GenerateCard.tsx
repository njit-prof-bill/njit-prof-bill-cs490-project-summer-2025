import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

import AIJobDescriptionsListGenerate from "@/components/AIJobDescriptionsListGenerate";
import GenerateResumeButton from '@/components/GenerateResumeButton';

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
 
    const handleGenerationComplete = (result: GenerationResult) => {
        console.log('Resume generated:', result);
        setIsGenerating(false);
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
        <div>
            <h2 className="text-2xl font-bold mb-4 text-white">
                <GenerateResumeButton 
                    selectedJob={selectedJob}
                    onGenerationComplete={handleGenerationComplete}
                    size="lg"
                    variant="primary"
                    className="w-64 mx-auto"
                    // className="w-full"
                />
            </h2>




            <div className="flex flex-row w-full max-w">
                <div className="flex w-full h-screen">
                    <div className="flex-1 p-0.5 p-1">
                        <img src="/resume-page-example-2.jpg" alt="Fetched Image" />  
                    </div>

                    <div className="flex-1 p-0.5 p-1 relative">
                        {/* Toggle Button */}
                        <div className="absolute top-0 right-0 z-10 mb-4">
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

                        {/* Job Descriptions Section with smooth transition */}
                        <div className={`transition-all duration-300 ease-in-out ${
                            showJobDescriptions 
                                ? 'opacity-100 translate-y-0' 
                                : 'opacity-0 -translate-y-4 pointer-events-none'
                        }`}>
                            {showJobDescriptions && (
                                <div className="pt-12"> {/* Add top padding to account for toggle button */}
                                    <AIJobDescriptionsListGenerate 
                                        selectedJob={selectedJob}
                                        onJobSelect={handleJobSelect}
                                        onGenerate={handleGenerate}
                                        isGenerating={isGenerating}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Optional: Show a placeholder when hidden */}
                        {!showJobDescriptions && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-zinc-500">
                                    <p className="text-lg mb-2">Job descriptions are hidden</p>
                                    <p className="text-sm">Click "Show Jobs" to view them</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}