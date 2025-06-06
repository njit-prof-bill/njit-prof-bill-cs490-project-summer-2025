"use client";


import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

// import { useState, useEffect } from 'react';

export default function HomePage() {

    const { user, loading } = useAuth();
    const router = useRouter();


    // Debugging:
    const [message, setMessage] = useState('');
    const [imgSrc, setImgSrc] = useState('');


    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }

    


// Debugging:
    useEffect(() => {
    // Fetch data from the API route
    fetch('/api/hello')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error('Error fetching API:', error));
  }, []);


// useEffect(() => {
//     fetch('/api/cat')
//       .then((res) => {
//         return res.blob(); // OK to convert to blob here
//       })
//       .then((blob) => {
//         const objectUrl = URL.createObjectURL(blob);
//         setImgSrc(objectUrl);
//       })
//   }, []);






 
    return (
        <div className="flex flex-col items-center">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Team Phoenix: Project AI Resume Builder</CardTitle>
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

            <br />
            
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>ATeam Phoenix: The Project AI Resume Builder</CardTitle>
                    <p>{message}</p>
                    <img src="/api/cat" alt="Fetched Image" />
                </CardHeader>
            </Card>

        </div>
    );
}