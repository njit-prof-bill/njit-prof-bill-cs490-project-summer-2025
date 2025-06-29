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


                    <div className="flex-1 p-0.5 p-1">

                        {/* Toggle here, for hiding this div and showing it */}


                        <AIJobDescriptionsListGenerate 
                            selectedJob={selectedJob}
                            onJobSelect={handleJobSelect}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}