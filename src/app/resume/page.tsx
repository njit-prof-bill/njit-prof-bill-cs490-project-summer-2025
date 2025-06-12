"use client";


import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { UserNameAddUpdate } from '@/components/userNameAddUpdate';
import Spinner, { spinnerStyles } from '../../components/ui/Spinner';
import SubmissionFeedback from "@/components/SubmissionFeedback";




export default function HomePage() {

    const { user, loading } = useAuth();
    const router = useRouter();
    const [submissionStatus, setSubmissionStatus] = useState<null | { type: "success" | "error"; message: string }>(null);



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

    const handleSubmit = () => {
        setSubmissionStatus(null); // clear current state first
      
        setTimeout(() => {
          const success = false; // or random
          setSubmissionStatus({
            type: success ? "success" : "error",
            message: success ? "Submission successful!" : "Submission failed. Please try again.",
          });
        }, 0);
    };

 
    return (
        
        <div className="flex flex-col items-center">
            
            <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
                <CardTitle>
                Get started now
                </CardTitle>
            </CardHeader>

            <CardContent>
                <CardDescription>
                Upload a DOCX file containing your resume.
                </CardDescription>

                <button
                onClick={handleSubmit}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                Upload
                </button>

                {submissionStatus && (
                <div className="mt-4">
                    <SubmissionFeedback
                    type={submissionStatus.type}
                    message={submissionStatus.message}
                    />
                </div>
                )}
            </CardContent>

            <CardFooter>
                <CardDescription></CardDescription>
            </CardFooter>
            </Card>




        <Card className="w-full max-w-md shadow-lg">

                <CardHeader>
                    <CardTitle>Placeholder: For resume generator </CardTitle>
                </CardHeader>

                <CardContent>
                    <CardDescription>
                    <img src="/resume-page-example.jpg" alt="Fetched Image" />   
                    <img src="/resume-page-example-2.jpg" alt="Fetched Image" />  
                        <br />
                    

                    </CardDescription>
                </CardContent>


                <CardFooter>
                    <CardDescription></CardDescription>
                </CardFooter>

            </Card>


        
            
         
        </div>
    );
}