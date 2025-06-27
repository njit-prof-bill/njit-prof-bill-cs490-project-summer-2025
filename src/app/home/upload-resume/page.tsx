"use client";

import React, { useRef, useState, useEffect } from "react";
import { FileUpload, FileUploadSelectEvent, ItemTemplateOptions } from "primereact/fileupload";
import { Button } from "primereact/button";
import { getAIResponse, saveAIResponse, AIPrompt } from "@/components/ai/aiPrompt";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
// For DOCX previews
import { renderAsync } from "docx-preview";
import html2canvas from "html2canvas";

// For PDF previews
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
  
  // New states for combined progress bar
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // For controlling PDF previews
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  // For controlling DOCX previews
  const docxContainerRef = useRef<HTMLDivElement>(null);
  // For controlling extracted text
  const [extractedText, setExtractedText] = useState<string | null>(null);
  
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
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 70);
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
          // let previewUploaded = false;

          // // If the PDF preview image exists, upload it
          // if (pdfPreviewUrl) {
          //   const previewBlob = dataURLtoBlob(pdfPreviewUrl);
          //   const previewPath = `users/${user.uid}/${file.name}_preview.png`;
          //   const previewRef = ref(storage, previewPath);
          //   const previewUploadTask = uploadBytesResumable(previewRef, previewBlob);

          //   await new Promise<void>((resolve, reject) => {
          //     previewUploadTask.on(
          //       "state_changed",
          //       (snapshot) => {
          //         const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 10);
          //         setUploadProgress((prev) => Math.min(prev + percent, 90));
          //       },
          //       reject,
          //       resolve
          //     );
          //   });

          //   previewUploaded = true;
          // }

          // if (!previewUploaded) {
          //   // Generate a preview of a DOCX file
          //   const docxImageBlob = await generateDocxPreviewImage();
          //   if (docxImageBlob) {
          //     const previewPath = `users/${user.uid}/${file.name}_preview.png`;
          //     const previewRef = ref(storage, previewPath);
          //     const previewUploadTask = uploadBytesResumable(previewRef, docxImageBlob);

          //     await new Promise<void>((resolve, reject) => {
          //       previewUploadTask.on(
          //         "state_changed",
          //         (snapshot) => {
          //           const percent = Math.round(
          //             (snapshot.bytesTransferred / snapshot.totalBytes) * 10
          //           );
          //           setUploadProgress((prev) => Math.min(prev + percent, 90));
          //         },
          //         reject,
          //         resolve
          //       );
          //     });
          //   }
          // }

          // Simulate progress while processing
          for (let i = 91; i <= 95; i++) {
            await new Promise((r) => setTimeout(r,20));
            setUploadProgress(i);
          }

          // Get the user's ID token
          const idToken = await getAuth().currentUser?.getIdToken();
          if (!idToken) throw new Error("Failed to get ID token.");

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
          for (let i = 96; i <= 100; i++) {
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

  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
  }

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
      const viewport = page.getViewport({ scale: 1 });

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
      // If user switches to PDF file
      if (docxContainerRef.current) {
        docxContainerRef.current.innerHTML = "";
      }
    } catch (err) {
      console.error("PDF preview error: ", err);
      setPdfPreviewUrl(null);
    }
  };

  const generateDocxPreview = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (docxContainerRef.current) {
        docxContainerRef.current.innerHTML = "";
        await renderAsync(arrayBuffer, docxContainerRef.current, undefined, {
          className: "docx-preview-content",
        });
        setPdfPreviewUrl(null) // If user switches to DOCX file
      }
    } catch (err) {
      console.error("DOCX preview error: ", err);
      if (docxContainerRef.current) {
        docxContainerRef.current.innerHTML = "<p>❌ Failed to generate DOCX preview</p>"
      }
    }
  };

  const generateDocxPreviewImage = async (): Promise<Blob | null> => {
    if (!docxContainerRef.current) return null;

    try {
      const canvas = await html2canvas(docxContainerRef.current, {
        backgroundColor: "#fff" // White
      });
      const blob: Blob | null = await new Promise((resolve) => 
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      return blob;
    } catch (err) {
      console.error("Failed to generate PNG of DOCX preview: ", err);
      return null;
    }
  }

  const onSelect = (e: FileUploadSelectEvent) => {
    const allowedExtensions = ["pdf", "docx", "txt", "md", "odt"];
    const isValid = e.files.every((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      // ext might be of type 'undefined' instead of 'string'
      if (!ext) return false;
      return allowedExtensions.includes(ext);
    });

    if (!isValid) {
      setUploadSuccess(false);
      setUploadMessage("❌ This file type is not supported.");
      fileUploadRef.current?.clear();
      setPdfPreviewUrl(null);
      if (docxContainerRef.current) {
        docxContainerRef.current.innerHTML = "";
      }
      return;
    }

    // Determine the file type
    const pdfFile = e.files.find((file) => file.name.toLowerCase().endsWith(".pdf"));
    const docxFile = e.files.find((file) => file.name.toLowerCase().endsWith(".docx"));

    if (pdfFile) {
      generatePdfPreview(pdfFile);
    } else if (docxFile) {
      generateDocxPreview(docxFile);
    } else {
      setPdfPreviewUrl(null);
      if (docxContainerRef.current) {
        docxContainerRef.current.innerHTML = "";
      }
    }
  };

  const onClear = () => {
    setUploadMessage(null);
    setUploadSuccess(null);
    setIsUploading(false);
    setUploadProgress(0);
    setPdfPreviewUrl(null);
    setExtractedText(null);
    if (docxContainerRef.current) {
      docxContainerRef.current.innerHTML = "";
    }
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

      <div className="mt-6 p-4 bg-gray-100 rounded-md text-sm text-black max-h-96 overflow-y-auto">
        <h3 className="font-semibold mb-2">DOCX Preview:</h3>
        <div className="docx-preview-reset">
          <div
          ref={docxContainerRef}
          className="prose max-w-none"></div>
        </div>
      </div>

      {extractedText && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md text-sm text-black max-h-96 overflow-y-auto whitespace-pre-wrap">
          <h3 className="font-semibold mb-2">Extracted Text:</h3>
          {extractedText}
        </div>
      )}
    </div>
  );
}