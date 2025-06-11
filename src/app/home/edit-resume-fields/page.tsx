"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditResumeFieldsPage() {
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
        <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Edit Resume Info</h1>
            </div>
        </div>
    );
}