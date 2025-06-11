"use client";


import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

import { UserNameAddUpdate } from '@/components/userNameAddUpdate';



import Spinner, { spinnerStyles } from '../../components/ui/Spinner';

import { ChatSection } from '@/components/ChatSection';




export default function HomePage() {

    const { user, loading } = useAuth();
    const router = useRouter();


    // Debugging:
    // const [message, setMessage] = useState('');

    // ---------------Groq, API variables, types:------------------
    const [responseMsg, setResponseMsg] = useState<string | null>(null);
    const [gloading, setLoading] = useState(false);
    //---------------------------------------------------




    
    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }




    
const callApi = async () => {
    setLoading(true);
    try {

        // request sent to the API for groq, with message asking for house stark:
      const res = await fetch('/api/groq-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Recite the words of House Stark.' }),
      });

    //   turn the response message into json format:
      const data = await res.json();

    // now set local response variable to the json response and print to display:
      setResponseMsg(data.choices?.[0]?.message?.content || 'No response');



    } catch (err) {
      setResponseMsg('Error calling API');
    } finally {
      setLoading(false);
    }
  };




 
    return (
        <div className="flex flex-col items-center">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Team Phoenix: Project AI Resume Builder</CardTitle>
                </CardHeader>
                <CardContent>

                {/* team logo, for now, can be moved. */}
                <img src="/team-logo-1.jpg" alt="Fetched Image" />

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
                    <CardTitle>Basic User Profile:</CardTitle>

                    <UserNameAddUpdate />





                    <div>
                    <h1>Test Groq Chat API</h1>
                    <button onClick={callApi} disabled={gloading}>
                        {gloading ? 'Loading...' : 'Send Request'}
                    </button>

                        {/* Spinner */}
                            <style>{spinnerStyles}</style>
                            {gloading && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                                    <Spinner />
                                </div>
                            )}

                    {responseMsg && <p>Response: {responseMsg}</p>}
                    </div>




                </CardHeader>

                
                               {/* Add the chat section */}
        <ChatSection />
         


 
            </Card>

        </div>
    );
}