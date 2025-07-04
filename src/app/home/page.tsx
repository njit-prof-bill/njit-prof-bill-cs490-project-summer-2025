"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Briefcase, 
  Zap,
  CheckCircle
} from "lucide-react";
import Image from "next/image";

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
            <div className="max-w-4xl mx-auto text-center">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
                    <CardContent className="p-10">
                        {/* Logo and Title */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <Image
                                src="/new-logo.png"
                                alt="Pisces Logo"
                                width={60}
                                height={60}
                                className="rounded-full shadow-lg"
                            />
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                    Welcome to Pisces
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                                    Your AI-powered resume builder
                                </p>
                            </div>
                        </div>
                        
                        {/* Description */}
                        <div className="space-y-8 mb-10">
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                Build professional resumes tailored to any job with the power of AI. 
                                Upload your existing resume or create one from scratch, then let our 
                                intelligent system help you craft the perfect application.
                            </p>
                            
                            {/* Features */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                                <div className="flex items-center gap-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="bg-blue-500 p-3 rounded-full flex-shrink-0">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Smart Resume Builder</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">AI extracts and organizes your information</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="bg-purple-500 p-3 rounded-full flex-shrink-0">
                                        <Briefcase className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Job Matching</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Tailor resumes to specific job postings</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="bg-green-500 p-3 rounded-full flex-shrink-0">
                                        <Zap className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Instant Results</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Get professional results in minutes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Getting Started */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                Get Started
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                Use the sidebar to navigate to different sections. Start by uploading your resume 
                                or creating one from scratch using our free-form editor.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                <span className="bg-white dark:bg-gray-600 px-4 py-2 rounded-full">Upload Resume</span>
                                <span className="bg-white dark:bg-gray-600 px-4 py-2 rounded-full">Free-form Editor</span>
                                <span className="bg-white dark:bg-gray-600 px-4 py-2 rounded-full">Job Matching</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}