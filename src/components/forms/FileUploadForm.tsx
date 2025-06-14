"use client";

import React, { useRef, useState } from "react";
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function FileUploadForm() {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [biographyText, setBiographyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbackMessageID, setFeedbackMessageID] = useState("");
    const [isError, setIsError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
            setBiographyText("");
            notifications.clean();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // If nothing is selected
        if(!selectedFile && biographyText.trim() == "") {
            notifications.update({
                        id: feedbackMessageID,
                        color: 'red',
                        title: 'No data found',
                        message: 'Please upload a file or enter biography text before submitting.',
                        icon: <IconX size={18} />,
                        loading: false,
                        autoClose: 4000,
                        withCloseButton: true
                    });
            setIsSubmitting(false);
            setIsError(true);
            return;
        }

        try {
            const formData = new FormData();

            if(selectedFile) {
                formData.append("file", selectedFile);
            }

            if(biographyText.trim() !== "") {
                formData.append("biography", biographyText.trim());
            }

            // Send to backend
            const response = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if(response.ok) {
                notifications.update({
                    id: feedbackMessageID,
                    color: 'teal',
                    title: 'Success',
                    message: `${data.message}`,
                    icon: <IconCheck size={18} />,
                    loading: false,
                    autoClose: 1000,
                    withCloseButton: true,
                    onClose: () => {
                        router.push(`/home/resume_editor/${data.id}`)
                    },
                });

                setIsError(false);
            }
            else {
                notifications.update({
                        id: feedbackMessageID,
                        color: 'red',
                        title: 'Error',
                        message: `${data.error || 'Unknown error'}`,
                        icon: <IconX size={18} />,
                        loading: false,
                        autoClose: 4000,
                        withCloseButton: true
                    });
                setIsError(true);
            }
        }
        catch(error) {
            if (error instanceof Error) {
                notifications.update({
                        id: feedbackMessageID,
                        color: 'red',
                        title: 'Error',
                        message: `${error.message}`,
                        icon: <IconX size={18} />,
                        loading: false,
                        autoClose: 4000,
                        withCloseButton: true
                    });
            }
            else {
                notifications.update({
                        id: feedbackMessageID,
                        color: 'red',
                        title: 'Error',
                        message: "An unknown error occurred.",
                        icon: <IconX size={18} />,
                        loading: false,
                        autoClose: 4000,
                        withCloseButton: true
                    });
            }
            setIsError(true);
        }
        finally {
            setIsSubmitting(false);
        }

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
                    notifications.clean();
                }}
                placeholder="Type your biography here..."
                className="border p-2 rounded min-h-[150px]"
            />
            <Button
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                    const id = notifications.show({
                    loading: true,
                    title: 'Loading your data',
                    message: 'Data Loading..',
                    autoClose: false,
                    withCloseButton: false,
                    });
                    setFeedbackMessageID(id);
                }}
                >
                {isSubmitting ? "Uploading..." : "Upload"}
            </Button>
        </form>
    );
}
