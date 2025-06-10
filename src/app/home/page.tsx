"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            {/*
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Marcus App Template</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        This app is a starter template for SaaS applications. To use this template, simply fork the repository and install the app dependencies.
                    </CardDescription>
                </CardContent>
                <CardFooter>
                    <CardDescription>Copyright 2025 Fourier Gauss Labs</CardDescription>
                </CardFooter>
            </Card>
            */} 
            {/* Upload Section */}
            <div className="w-full max-w-md bg-gray-900/40 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4 text-center">Upload Your Resume</h2>
                <FileUpload />
            </div>
        </div>
    );
}