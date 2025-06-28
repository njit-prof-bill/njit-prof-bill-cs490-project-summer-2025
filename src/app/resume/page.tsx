"use client";

import BaseLayout from '../../components/BaseLayout';
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useRef } from "react";
import Spinner, { spinnerStyles } from '@/components/ui/Spinner';
import { processDocumentHandler } from '@/lib/processDocument';
import { getSourceDocIdFromFile } from '@/utils/getSourceDocId';

import GeneratorPageLayout from "../../components/GeneratorPageLayout";




import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import SubmissionFeedback from "@/components/SubmissionFeedback";



export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    null | { type: "success" | "error"; message: string }
>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  

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


  <div>

         {/* <GeneratorCard /> */}
              <GeneratorPageLayout />
  </div>


  // <BaseLayout
  //   leftContent={<div>Left Sidebar</div>}
  
  
  //   middleContent={
  //     <div className="flex flex-col items-center">
  //       <Card className="w-full max-w-md shadow-lg">
  //         <CardHeader>
  //           <CardTitle>Upload Your Resume</CardTitle>
  //         </CardHeader>
  //         <CardContent className="space-y-4">
  //           <CardDescription>  Upload a resume file (.docx, .pdf, .txt, .md)</CardDescription>
  //           <style>{spinnerStyles}</style>
  //             {uploading && (
  //               <div style={{ display: 'flex', justifyContent: 'center' }}>
  //                 <Spinner />
  //               </div>
  //             )}
  //           <input
  //             id="docx-upload"
  //             type="file"
  //             accept=".docx,.pdf,.txt,.md"
  //             onChange={handleUploadAfterPick}
  //             ref={fileInputRef}
  //             className="hidden"
  //           />
  //           <label htmlFor="docx-upload" className="cursor-pointer">
  //             <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
  //               {uploading ? "Uploading..." : "Select and Upload"}
  //             </div>
  //           </label>
  //           {submissionStatus && (
  //             <SubmissionFeedback
  //               type={submissionStatus.type}
  //               message={submissionStatus.message}
  //             />
  //           )}
  //         </CardContent>
  //         <CardFooter />
  //       </Card>


            


  //     </div>






  //   }


    
  //   // rightContent={<div>Right Sidebar</div>}


  // />
);

}
