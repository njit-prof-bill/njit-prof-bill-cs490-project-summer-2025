"use client";




import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";



import JobDescriptionsList from "@/components/JobDescriptionsList";

import JobDescriptionUpload from "@/components/JobDescriptionUpload";


import { useRef } from "react";




export default function JobDescUploadAndListPrev() {

    const { user, loading } = useAuth();
    const router = useRouter();


    // Job List and Upload reference for refreshing the list when an upload is successful:
    const listRef = useRef<{ fetchJobDescriptions: () => void }>(null);



    // Debugging:
    const [message, setMessage] = useState('');



    // Function to refresh the job descriptions list
  const handleJobAdded = () => {
    if (listRef.current) {
      listRef.current.fetchJobDescriptions();
    }
  };




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
         

         <Card className="w-full max-w shadow-lg">

                <CardHeader>
                    <CardTitle> </CardTitle>
                </CardHeader>

                <CardContent>


{/* -----------Job Description Listings display UI and Upload ------------*/}
                <JobDescriptionUpload onJobAdded={handleJobAdded} />

                 <JobDescriptionsList ref={listRef} />
{/* ---------------------------------------------- */}


                    <CardDescription>
            
                    </CardDescription>
                </CardContent>

            </Card>

        </div>
    );
}