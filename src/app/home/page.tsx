"use client";


import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

import { UserNameAddUpdate } from '@/components/userNameAddUpdate';



import Spinner, { spinnerStyles } from '../../components/ui/Spinner';



export default function HomePage() {

    const { user, loading } = useAuth();
    const router = useRouter();


    // Debugging:
    const [message, setMessage] = useState('');



    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }

    

 
    return (
        <div className="flex flex-col items-center">
        
        
            <Card className="w-full max-w-md shadow-lg">

                <CardHeader>
                    <CardTitle>Placeholder: For Components... <br /> <br /> "Get started now: upload a resume:"</CardTitle>
                </CardHeader>

                <CardContent>
                    <CardDescription>
                        Add all 4 components here: pdf getter, docx getter, user text input, txt file getter:
                        Arrange in box pattern, 
                         <img src="/home-page-example.jpg" alt="Fetched Image" />
                        <br />
                        <br />
                        [pdf]  [docx]
                        <br />
                        [txt]  [free text]

                    </CardDescription>
                </CardContent>


                <CardFooter>
                    <CardDescription></CardDescription>
                </CardFooter>

            </Card>


            {/*  ------------------------ */}
            <br />
            <br />

            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Team Phoenix: Project AI Resume Builder</CardTitle>
                </CardHeader>
                <CardContent>

                {/* team logo, for now, can be moved. */}
                <img src="/team-logo-1.jpg" alt="Fetched Image" />

                    <CardDescription>
                        Use AI to help build a competitive resume for your career needs.
                    </CardDescription>
                </CardContent>
                <CardFooter>
                    <CardDescription>Copyright 2025 Phoenix Team Ltd.</CardDescription>
                </CardFooter>
            </Card>



        </div>
    );
}