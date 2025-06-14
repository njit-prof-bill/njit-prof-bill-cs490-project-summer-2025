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
                    <CardTitle>Placeholder: recent activity </CardTitle>
                </CardHeader>

                <CardContent>
                    <CardDescription>
              
                    

                    </CardDescription>
                </CardContent>


                <CardFooter>
                    <CardDescription></CardDescription>
                </CardFooter>

            </Card>




        </div>
    );
}