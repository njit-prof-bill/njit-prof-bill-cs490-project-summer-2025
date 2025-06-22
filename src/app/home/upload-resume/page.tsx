"use client";

import React, { useRef, useState, useEffect } from "react";
import { FileUpload, FileUploadSelectEvent, ItemTemplateOptions } from "primereact/fileupload";
import { Button } from "primereact/button";
import { getAIResponse, saveAIResponse, AIPrompt } from "@/components/ai/aiPrompt";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export default function UploadResumePage() {
  // For checking whether the user is logged in and redirecting them accordingly
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileUploadRef = useRef<FileUpload>(null);
  // For visual feedback to the user
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  // New states for combined progress bar
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // For controlling PDF previews
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // Redirect to landing page if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Loading...</p>; // Show a loading state while checking auth
  }

  // Upload handler wired to both default button and custom upload button
  const onUpload = async () => {
    const files = fileUploadRef.current?.getFiles();
    if (!files || files.length === 0 || !user) return;

    const file = files[0];
    const filePath = `users/${user.uid}/${file.name}`;
    const fileRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);
    // const formData = new FormData();
    // formData.append("file", file);

    // Reset states and start progress
    setIsUploading(true);
    setUploadProgress(0);
    setUploadMessage(null);
    setUploadSuccess(null);
    setExtractedText(null);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Update the progress of the upload operation
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 80);
        setUploadProgress(percent);
      },
      (error) => {
        console.error("Upload error: ", error);
        setIsUploading(false);
        setUploadSuccess(false);
        setUploadMessage(`❌ Upload failed. ${error.message}`);
      },
      async () => {
        try {
          // Simulate progress while processing
          for (let i = 81; i <= 90; i++) {
            await new Promise((r) => setTimeout(r,20));
            setUploadProgress(i);
          }

          // Get the user's ID token
          const idToken = await getAuth().currentUser?.getIdToken();
          if (!idToken) {
            throw new Error("Failed to get ID token.");
          }

          // Call the file processing API
          const response = await fetch("/api/process-upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath, idToken }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || result.message || "Processing failed");
          }

          setExtractedText(result.rawText);

          // Simulate AI processing progress
          for (let i = 91; i <= 100; i++) {
            await new Promise((r) => setTimeout(r, 20));
            setUploadProgress(i);
          }

          // Run an API call (on the client side) to the AI
          const aiResponse = await getAIResponse(AIPrompt, result.rawText);
          const parsedAIResponse = JSON.parse(aiResponse);
          await saveAIResponse(parsedAIResponse, {uid: user.uid}, db);

          setUploadProgress(100);
          setUploadSuccess(true);
          setUploadMessage("✅ File uploaded, text extracted, and AI processed successfully!");
        } catch (error: any) {
          console.error("Processing error: ", error);
          setUploadSuccess(false);
          setUploadMessage(`❌ Processing failed: ${error.message}`);
        } finally {
          setIsUploading(false);
        }
      }
    );
  };

  const onRemove = (file: File, callback: () => void) => {
    callback();
    setUploadMessage(null);
    setExtractedText(null);
    setPdfPreviewUrl(null);
  };

  const generatePdfPreview = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context!,
        viewport: viewport,
      }).promise;

      const dataUrl = canvas.toDataURL();
      setPdfPreviewUrl(dataUrl);
    } catch (err) {
      console.error("PDF preview error: ", err);
      setPdfPreviewUrl(null);
    }
  };

  const onSelect = (e: FileUploadSelectEvent) => {
    const allowedExtensions = ["pdf", "docx", "txt", "md", "odt"];
    const isValid = e.files.every((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      // ext might be of type 'undefined' instead of 'string'
      if (!ext) {
        return false;
      }
      return allowedExtensions.includes(ext);
    });

    if (!isValid) {
      setUploadSuccess(false);
      setUploadMessage("❌ This file type is not supported.");
      fileUploadRef.current?.clear();
      setPdfPreviewUrl(null);
      return;
    }

    // If a PDF file was selected, generate a preview of it
    const pdfFile = e.files.find((file) => file.name.toLowerCase().endsWith(".pdf"));
    if (pdfFile) {
      generatePdfPreview(pdfFile);
    } else {
      setPdfPreviewUrl(null);
    }
  };

  const onClear = () => {
    setUploadMessage(null);
    setUploadSuccess(null);
    setExtractedText(null);
    setIsUploading(false);
    setUploadProgress(0);
    setPdfPreviewUrl(null);
  };

  const itemTemplate = (
    file: { [key: string]: any },
    options: ItemTemplateOptions
  ) => (
    <div className="flex items-center justify-between p-3 border rounded-md w-full bg-white dark:bg-stone-800 mt-2">
      <div className="flex items-center gap-3">
        <i className="pi pi-file" style={{ fontSize: "1.5rem" }}></i>
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-xs">
            {file.name}
          </span>
          <small className="text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString()}</small>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          icon="pi pi-upload"
          className="p-button-sm p-button-success p-button-text"
          onClick={onUpload} // custom upload button
        />
        <Button
          icon="pi pi-times"
          className="p-button-sm p-button-danger p-button-text"
          onClick={options.onRemove}
        />
      </div>
    </div>
  );

  const emptyTemplate = () => (
    <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 py-10">
      <i className="pi pi-upload text-5xl mb-4" />
      <span>Drag and drop your resume here</span>
    </div>
  );

  return (
    <div className="p-4">
      <FileUpload
        ref={fileUploadRef}
        name="file"
        //url="/api/upload"
        accept=".pdf,.PDF,.docx,.DOCX,.txt,.md,.odt,.TXT,.MD,.ODT"
        customUpload
        uploadHandler={onUpload} // <--- This wires default upload button to your handler
        onSelect={onSelect}
        onError={onClear}
        onClear={onClear}
        itemTemplate={itemTemplate}
        emptyTemplate={emptyTemplate}
      />

      {isUploading && (
        <div className="mt-4 relative w-full bg-gray-300 rounded-md h-6 overflow-hidden">
          {/* Blue progress fill */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300 ease-in-out"
            style={{ width: `${uploadProgress}%` }}
          ></div>

          {/* Centered text inside progress bar */}
          <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm">
            {uploadProgress < 80
              ? `Uploading... ${uploadProgress}%`
              : uploadProgress < 100
              ? `Processing with AI... ${uploadProgress}%`
              : `Finalizing...`}
          </div>
        </div>
      )}

      {uploadMessage && (
        <div
          className={`mt-4 p-3 rounded-md text-white ${
            uploadSuccess ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {uploadMessage}
        </div>
      )}

      {pdfPreviewUrl && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">PDF Preview (Page 1):</h3>
          <img
            src={pdfPreviewUrl}
            alt="PDF Preview"
            className="border rounded shadow max-w-full h-auto"
          ></img>
        </div>
      )}

      {extractedText && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md text-sm text-black max-h-96 overflow-y-auto whitespace-pre-wrap">
          <h3 className="font-semibold mb-2">Extracted Text:</h3>
          {extractedText}
        </div>
      )}
    </div>
  );
}

// "use client";

// import React, { useRef } from "react";
// import { Toast } from "primereact/toast";
// import { FileUpload } from "primereact/fileupload";
// import { Button } from "primereact/button";

// export default function UploadResumePage() {
//   const toast = useRef(null);
//   const fileUploadRef = useRef(null);

//   const onUpload = async () => {
//     const files = fileUploadRef.current?.getFiles();
//     if (!files || files.length === 0) return;

//     const file = files[0];
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await res.json();

//       if (res.ok) {
//         console.log("Extracted raw text:", result.rawText); // ✅ Log to console
//         toast.current.show({
//           severity: "success",
//           summary: "File Uploaded",
//           detail: "Raw text extracted. Check console.",
//           life: 5000,
//         });
//       } else {
//         toast.current.show({
//           severity: "error",
//           summary: "Upload failed",
//           detail: result.error || "Something went wrong",
//           life: 5000,
//         });
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.current.show({
//         severity: "error",
//         summary: "Upload Error",
//         detail: "Network or server error.",
//         life: 5000,
//       });
//     }
//   };


//   const onRemove = (file, callback) => {
//     callback();
//   };

//   const onSelect = (e) => {
//     const allowedExtensions = ['pdf', 'PDF', 'docx', 'DOCX', 'txt', 'TXT', 'md', 'MD', 'odt', 'ODT'];

//     const isValid = e.files.every((file) => {
//       const ext = file.name.split('.').pop();
//       return allowedExtensions.includes(ext);
//     });

//     if (!isValid) {
//       toast.current.show({
//         severity: 'error',
//         summary: 'Unsupported File',
//         detail: 'This file type is not supported.',
//       });

//       fileUploadRef.current?.clear();
//     }
//   };

//   const onClear = () => {
//     // Optional: could show a toast or log
//   };

//   const itemTemplate = (file, props) => (
//     <div className="flex items-center justify-between p-3 border rounded-md w-full bg-white dark:bg-stone-800 mt-2">
//       <div className="flex items-center gap-3">
//         <i className="pi pi-file" style={{ fontSize: "1.5rem" }}></i>
//         <div className="flex flex-col">
//           <span className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-xs">
//             {file.name}
//           </span>
//           <small className="text-gray-500 dark:text-gray-400">
//             {new Date().toLocaleDateString()}
//           </small>
//         </div>
//       </div>

//       <div className="flex gap-2">
//         <Button
//           icon="pi pi-upload"
//           className="p-button-sm p-button-success p-button-text"
//           onClick={() => props.onUpload?.()}
//         />
//         <Button
//           icon="pi pi-times"
//           className="p-button-sm p-button-danger p-button-text"
//           onClick={() => onRemove(file, props.onRemove)}
//         />
//       </div>
//     </div>
//   );

//   const emptyTemplate = () => (
//     <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 py-10">
//       <i className="pi pi-upload text-5xl mb-4" />
//       <span>Drag and drop your resume here</span>
//     </div>
//   );

//   return (
//     <div className="p-4">
//       <Toast ref={toast} />
//       <FileUpload
//         ref={fileUploadRef}
//         name="file"
//         url="/api/upload"
//         accept=".pdf,.PDF,.docx,.DOCX,.txt,.md,.odt,TXT,.MD,.ODT"
//         customUpload
//         onUpload={onUpload}
//         onSelect={onSelect}
//         onError={onClear}
//         onClear={onClear}
//         itemTemplate={itemTemplate}
//         emptyTemplate={emptyTemplate}
//       />
//     </div>
//   );
// }
// "use client";

// import React, { useRef, useState } from "react";
// import { Toast } from "primereact/toast";
// import { FileUpload } from "primereact/fileupload";
// import { Button } from "primereact/button";

// export default function UploadResumePage() {
//   const toast = useRef(null);
//   const fileUploadRef = useRef(null);

//   const [uploadMessage, setUploadMessage] = useState<string | null>(null);
//   const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);

//   const onUpload = async () => {
//     const files = fileUploadRef.current?.getFiles();
//     if (!files || files.length === 0) return;

//     const file = files[0];
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await res.json();

//       if (res.ok) {
//         console.log("Extracted raw text:", result.rawText);
//         setUploadSuccess(true);
//         setUploadMessage("✅ File uploaded and text extracted successfully!");
//         toast.current.show({
//           severity: "success",
//           summary: "Success",
//           detail: "Raw text extracted. Check console.",
//           life: 5000,
//         });
//       } else {
//         setUploadSuccess(false);
//         setUploadMessage(`❌ Upload failed: ${result.error || "Something went wrong"}`);
//         toast.current.show({
//           severity: "error",
//           summary: "Upload failed",
//           detail: result.error || "Something went wrong",
//           life: 5000,
//         });
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       setUploadSuccess(false);
//       setUploadMessage("❌ Network or server error.");
//       toast.current.show({
//         severity: "error",
//         summary: "Upload Error",
//         detail: "Network or server error.",
//         life: 5000,
//       });
//     }
//   };

//   const onRemove = (file, callback) => {
//     callback();
//   };

//   const onSelect = (e) => {
//     const allowedExtensions = ["pdf", "docx", "txt", "md", "odt"];

//     const isValid = e.files.every((file) => {
//       const ext = file.name.split(".").pop()?.toLowerCase();
//       return allowedExtensions.includes(ext);
//     });

//     if (!isValid) {
//       toast.current.show({
//         severity: "error",
//         summary: "Unsupported File",
//         detail: "This file type is not supported.",
//       });

//       fileUploadRef.current?.clear();
//     }
//   };

//   const onClear = () => {
//     setUploadMessage(null);
//     setUploadSuccess(null);
//   };

//   const itemTemplate = (file, props) => (
//     <div className="flex items-center justify-between p-3 border rounded-md w-full bg-white dark:bg-stone-800 mt-2">
//       <div className="flex items-center gap-3">
//         <i className="pi pi-file" style={{ fontSize: "1.5rem" }}></i>
//         <div className="flex flex-col">
//           <span className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-xs">
//             {file.name}
//           </span>
//           <small className="text-gray-500 dark:text-gray-400">
//             {new Date().toLocaleDateString()}
//           </small>
//         </div>
//       </div>

//       <div className="flex gap-2">
//         <Button
//           icon="pi pi-upload"
//           className="p-button-sm p-button-success p-button-text"
//           onClick={onUpload}

//         />
//         <Button
//           icon="pi pi-times"
//           className="p-button-sm p-button-danger p-button-text"
//           onClick={() => onRemove(file, props.onRemove)}
//         />
//       </div>
//     </div>
//   );

//   const emptyTemplate = () => (
//     <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 py-10">
//       <i className="pi pi-upload text-5xl mb-4" />
//       <span>Drag and drop your resume here</span>
//     </div>
//   );

//   return (
//     <div className="p-4">
//       <Toast ref={toast} />
//       <FileUpload
//         ref={fileUploadRef}
//         name="file"
//         url="/api/upload"
//         accept=".pdf,.docx,.txt,.md,.odt"
//         customUpload
//         onUpload={onUpload}
//         onSelect={onSelect}
//         onError={onClear}
//         onClear={onClear}
//         itemTemplate={itemTemplate}
//         emptyTemplate={emptyTemplate}
//       />

//       {uploadMessage && (
//         <div
//           className={`mt-4 p-3 rounded-md text-white ${
//             uploadSuccess ? "bg-green-600" : "bg-red-600"
//           }`}
//         >
//           {uploadMessage}
//         </div>
//       )}
//     </div>
//   );
// }
