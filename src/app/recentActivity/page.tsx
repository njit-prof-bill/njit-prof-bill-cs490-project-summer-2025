"use client";


import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

import { UserNameAddUpdate } from '@/components/userNameAddUpdate';



import Spinner, { spinnerStyles } from '../../components/ui/Spinner';


import DocumentList from '@/components/DocumentList';



// import JobDescriptionsList from "@/components/JobDescriptionsList";

// import JobDescriptionUpload from "@/components/JobDescriptionUpload";


// import BaseLayout from "@/components/BaseLayout";




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
         







         <Card className="w-full max-w shadow-lg">

   

                <CardHeader>
                    {/* <CardTitle>Placeholder: recent activity </CardTitle> */}
                </CardHeader>

                <CardContent>

                 <div>
      <DocumentList className="max-w-4xl mx-auto" />
    </div>

{/* 
                <JobDescriptionUpload />

                <JobDescriptionsList /> */}




                    <CardDescription>
            
                    </CardDescription>
                </CardContent>



{/* 

                <CardFooter>
                    <CardDescription>
                        stuff
                    </CardDescription>
                </CardFooter> */}

            </Card>




        </div>
    );
}