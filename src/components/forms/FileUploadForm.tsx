"use client";

import React, { useRef, useState } from "react";

export default function FileUploadForm() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [biographyText, setBiographyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
            setFeedbackMessage("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        // This is for demo testing
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // If nothing is selected
        if(!selectedFile && biographyText.trim() == "") {
            setFeedbackMessage("Please upload a file or enter biography text before submitting.");
            setIsSubmitting(false);
            setIsError(true);
            return;
        }

        // Prioritize the file submission over the text
        if(selectedFile) {
            setFeedbackMessage(`Uploaded file: ${selectedFile.name}`);
            setIsError(false);
        }
        else if(biographyText.trim() !== "") {
            setFeedbackMessage(`Uploaded biography text.`);
            setIsError(false);
        }
        else {
            setFeedbackMessage("");
            setIsError(false);
        }

        setIsSubmitting(false);
    };

    const handleChooseFileClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 border p-4 rounded shadow max-w-md">
            <label className="font-semibold">Upload your document (PDF, DOCX, TXT, MD, ODT):</label>

            <div className="flex items-center gap-2">
                <input type="text" readOnly value={selectedFile ? selectedFile.name : "No file chosen"} className="flex-1 border p-2 rounded bg-gray-50 text-sm"/>
                <button type="button" onClick={handleChooseFileClick} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Select a file
                </button>
            </div>

            <input
                type="file"
                accept=".pdf,.docx,.txt,.md,.odt"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
            />

            <label className="font-semibold">Or enter your biography text:</label>
            <textarea
                value={biographyText}
                onChange={(e) => {
                    setBiographyText(e.target.value);
                    setSelectedFile(null);
                    setFeedbackMessage("");
                }}
                placeholder="Type your biography here..."
                className="border p-2 rounded min-h-[150px]"
            />
            
            <button type="submit" disabled={isSubmitting} className={`p-2 rounded text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}>
                {isSubmitting ? "Uploading..." : "Upload"}
            </button>

            {feedbackMessage && (
                <div className={`mt-2 font-medium ${isError ? "text-red-600" : "text-green-600"}`}>
                    {feedbackMessage}
                </div>
            )}
        </form>
    );
}