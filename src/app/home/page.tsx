"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UploadCard from "@/components/uploadCard";
import FreeformInputCard from "@/components/freeformInputCard";
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
        <div className="flex flex-wrap gap-4 p-4">
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
            
            <UploadCard />
            <FreeformInputCard />
        </div>
    );
}