"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
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
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Welcome to Pisces!</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        To get started, click "Upload Resume" in the sidebar and then choose a file to upload from your computer.<br></br><br></br>
                        Supported file formats:
                        <ul>
                            <li>PDF (.pdf)</li>
                            <li>Microsoft Word (.docx)</li>
                            <li>Plain text (.txt)</li>
                            <li>Markdown (.md)</li>
                            <li>OpenDocument (.odf)</li>
                        </ul>
                    </CardDescription>
                </CardContent>
                <CardFooter>
                    <CardDescription>
                        If you'd rather input free-form text for your resume info instead of uploading a file, click "Write Free-form" in the sidebar.
                    </CardDescription>
                </CardFooter>
            </Card>
        </div>
    );
}