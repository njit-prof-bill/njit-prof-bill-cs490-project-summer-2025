"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FileUploadForm from "@/components/forms/FileUploadForm";

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
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-6">Build Your Resume</h1>
            <FileUploadForm />
        </div>
    );
}