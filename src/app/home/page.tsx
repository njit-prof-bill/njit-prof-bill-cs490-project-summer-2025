"use client";

import BioUpload from "@/components/ui/bioUpload";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { UserNameAddUpdate } from '@/components/userNameAddUpdate';

import { getAuth } from "firebase/auth";
import { useRef } from "react";
import { processDocumentHandler } from '@/lib/processDocument';
import { getSourceDocIdFromFile } from '@/utils/getSourceDocId';

import SubmissionFeedback from "@/components/SubmissionFeedback";

import Spinner, { spinnerStyles } from '../../components/ui/Spinner';









export default function HomePage() {

    const { user, loading } = useAuth();
    const router = useRouter();


    // Debugging:
    const [message, setMessage] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    null | { type: "success" | "error"; message: string }
>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);




    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }
      





  const handleUploadAfterPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSubmissionStatus({ type: "error", message: "No file selected." });
      return;
    }

    setUploading(true);
    setSubmissionStatus(null);

    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const token = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/history/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      setSubmissionStatus({
        type: res.ok ? "success" : "error",
        message: data.message || (res.ok ? "Success" : "Upload failed."),
      });

      if (res.ok) {
        const sourceDocId = getSourceDocIdFromFile(file);
        await processDocumentHandler({
          user: currentUser,
          sourceDocId,
          onStatus: msg => console.log('[Processing Status]', msg),
          // optional: you can pass additionalPrompt if you ever want to
          // additionalPrompt: 'Please prioritize technical roles.'
        });
        window.location.reload()
      }
    } catch (err) {
      console.error("Upload error:", err);
      setSubmissionStatus({ type: "error", message: "Unexpected error." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
    }
  };

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

     {/* <div className="grid grid-cols-2 gap-4 p-4"> */}
     <div className="w-full flex flex-col items-center gap-4 p-4">

      {/* Card 1 */}
      
      <div className="w-full flex flex-col items-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Upload Your Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>  Upload a resume file (.docx, .pdf, .txt, .md)</CardDescription>
            <style>{spinnerStyles}</style>
              {uploading && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Spinner />
                </div>
              )}
            <input
              id="docx-upload"
              type="file"
              accept=".docx,.pdf,.txt,.md"
              onChange={handleUploadAfterPick}
              ref={fileInputRef}
              className="hidden"
            />
            <label htmlFor="docx-upload" className="cursor-pointer">
              <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                {uploading ? "Uploading..." : "Select and Upload"}
              </div>
            </label>
            {submissionStatus && (
              <SubmissionFeedback
                type={submissionStatus.type}
                message={submissionStatus.message}
              />
            )}
          </CardContent>
          <CardFooter />
        </Card>
      </div>
      
      {/* Card 2 */}
      {/* <div className="bg-gray-800 p-4 rounded shadow h-64 flex flex-col">
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
      </div> */}
      
      {/* Card 3 */}
      {/* <div className="bg-gray-800 p-4 rounded shadow h-64 flex flex-col">
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
      </div> */}

      {/* my component */}
      {/* Card 4 */} 
      <div className="w-full max-w-md shadow-lg">

        {/* <h2 className="font-bold mb-2">Freeform Text Input:</h2> */}
        
        <div className="flex-1 overflow-hidden">
          
        <Card className="w-full max-w-md shadow-lg"> 
          
                <CardHeader>
                    <CardTitle>Freeform Text Input:</CardTitle>
                   
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