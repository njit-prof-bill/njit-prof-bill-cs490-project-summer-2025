"use client";


import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";


import { ChatSection } from '@/components/ChatSection';


import BaseLayout from '../../components/BaseLayout';



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


    <BaseLayout
      leftContent={<div>Left Sidebar</div>}
      middleContent={<div>Main Content (majority space)</div>}
      rightContent={ <div>Left Sidebar</div>}
    />


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



 {/* -------------------Groq category json request component:---------------- */}
                {/*---------- Add the groq chat request component: --------------*/}
                <ChatSection />
                {/* ----------------------- */}




                </CardContent>


                <CardFooter>
                    <CardDescription></CardDescription>
                </CardFooter>

            </Card>

        
            
         
        </div>
    );
}