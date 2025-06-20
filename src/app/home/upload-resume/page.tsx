"use client";

import React, { useRef, useState, useEffect } from "react";
import { FileUpload, FileUploadFile, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { getAIResponse, saveAIResponse, AIPrompt } from "@/components/ai/aiPrompt";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function UploadResumePage() {
  // For checking whether the user is logged in and redirecting them accordingly
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // Redirect to landing page if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Loading...</p>; // Show a loading state while checking auth
  }

  const fileUploadRef = useRef<FileUpload>(null);

  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  // New states for combined progress bar
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload handler wired to both default button and custom upload button
  const onUpload = async () => {
    const files = fileUploadRef.current?.getFiles();
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    // Reset states and start progress
    setIsUploading(true);
    setUploadProgress(0);
    setUploadMessage(null);
    setUploadSuccess(null);
    setExtractedText(null);

    try {
      const xhr = new XMLHttpRequest();

      // 🟦 File upload progress (0% → 80%)
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 80);
          setUploadProgress(percent);
        }
      });

      xhr.onreadystatechange = async () => {
        if (xhr.readyState === 4) {
          const result = JSON.parse(xhr.responseText);

          if (xhr.status === 200) {
            setExtractedText(result.rawText);

            // 🟨 Simulate AI analysis (80% → 100%)
            for (let i = 81; i <= 99; i++) {
              await new Promise((r) => setTimeout(r, 20)); // small delay
              setUploadProgress(i);
            }

            try {
              const AIResponse = await getAIResponse(AIPrompt, result.rawText);
              const parsed = JSON.parse(AIResponse);
              await saveAIResponse(parsed, user, db);

              setUploadProgress(100);
              setUploadSuccess(true);
              setUploadMessage("✅ File uploaded and text extracted successfully!");
            } catch (error) {
              console.error("Error fetching or saving AI response:", error);
              setUploadSuccess(false);
              setUploadMessage("❌ AI processing failed.");
            }
          } else {
            setUploadSuccess(false);
            setUploadMessage(`❌ Upload failed: ${result.error || "Something went wrong"}`);
          }

          setIsUploading(false);
        }
      };

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadSuccess(false);
      setUploadMessage("❌ Upload failed. " + error.message);
      setIsUploading(false);
    }
  };

  const onRemove = (file: File, callback: () => void) => {
    callback();
    setUploadMessage(null);
    setExtractedText(null);
  };

  const onSelect = (e: FileUploadSelectEvent) => {
    const allowedExtensions = ["pdf", "docx", "txt", "md", "odt", "PDF", "DOCX", "TXT", "ODT"];
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
    }
  };

  const onClear = () => {
    setUploadMessage(null);
    setUploadSuccess(null);
    setExtractedText(null);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const itemTemplate = (file, props) => (
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
          onClick={() => onRemove(file, props.onRemove)}
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
        url="/api/upload"
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
