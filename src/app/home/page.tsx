"use client";

import BioUpload from "@/components/ui/bioUpload";
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




        <Card className="w-full shadow-lg items-center">
                <CardContent>
                    <CardDescription>
                        Use AI to help build a competitive resume for your career needs.
                        
                    </CardDescription>
                </CardContent>   
            </Card>










{/* ---------------------  Document Input components Here: ------------------------------------------------- */}

     <div className="grid grid-cols-2 gap-4 p-4">
      {/* Card 1 */}
      <div className="bg-gray-800 p-4 rounded shadow h-64 flex flex-col">
        <h2 className="font-bold mb-2">PDF-Document:</h2>
        <div className="flex-1 overflow-hidden">

         <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Place Respective Component In Here:</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        Use AI to help build a competitive resume for your career needs.
                    </CardDescription>
                </CardContent>
               
            </Card>



        </div>
      </div>
      
      {/* Card 2 */}
      <div className="bg-gray-800 p-4 rounded shadow h-64 flex flex-col">
        <h2 className="font-bold mb-2">Docx Document:</h2>
        <div className="flex-1 overflow-hidden">
         
        <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Place Respective Component In Here:</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        Use AI to help build a competitive resume for your career needs.
                    </CardDescription>
                </CardContent>
               
            </Card>

        </div>
      </div>
      
      {/* Card 3 */}
      <div className="bg-gray-800 p-4 rounded shadow h-64 flex flex-col">
        <h2 className="font-bold mb-2">Txt Document:</h2>
        <div className="flex-1 overflow-hidden">


          <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Place Respective Component In Here:</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        Use AI to help build a competitive resume for your career needs.
                    </CardDescription>
                </CardContent>
               
            </Card>

        </div>
      </div>

      {/* my component */}
      {/* Card 4 */} 
      <div className="bg-gray-800 p-4 rounded shadow flex flex-col">

        <h2 className="font-bold mb-2">Freeform Text Input:</h2>
        <div className="flex-1 overflow-hidden">
          
        <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Place Respective Component In Here:</CardTitle>
                </CardHeader>
                <CardContent>
                    <BioUpload/>
                </CardContent>
               
            </Card>


        </div>
      </div>
    </div>


{/*  ------------------------------------------------------- */}







            {/*  ------- Etc placeholder for team logo stuff: ----------------- */}
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