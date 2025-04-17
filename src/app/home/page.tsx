"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/"); // Redirect to landing page
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
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
                    <Button onClick={handleLogout} className="w-full">
                        Log Out
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}