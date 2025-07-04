"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import React from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, addDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { getAIResponse, saveAIResponse, AIPrompt } from "@/components/ai/aiPrompt";
import { User } from "firebase/auth";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { date } from "zod";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Trash2, FileText, Clock, ChevronDown, ChevronUp, Save, Edit3, Sparkles } from "lucide-react";

type freeFormEntry = {
    text: string;
    label: string;
    dateSubmitted: Timestamp;
};

type DeleteButtonProps = {
    index: number;
    freeFormList: freeFormEntry[];
    setFreeFormList: React.Dispatch<React.SetStateAction<freeFormEntry[]>>;
    user: User | null;
};

function DeleteButton({index, freeFormList, setFreeFormList, user}: DeleteButtonProps) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Controls whether the confirmation dialog is open
    const [open, setOpen] = useState(false);

    async function confirmDelete(event: React.MouseEvent<HTMLButtonElement>) {
        if (!user) return;
        event.preventDefault(); // Prevent the browser from reloading the page
        setDeleting(true);
        setError(null);
        try {
            const newList = freeFormList.filter((_, i) => i !== index);
            setFreeFormList(newList);
            const newListRef = doc(db, "users", user.uid);
            await updateDoc(newListRef, {freeFormText: newList});
            console.log("Free-form text successfully deleted.");
            setOpen(false);
        } catch (error) {
            console.error("Error deleting free-form text: ", error);
            setError("Failed to delete free-form text.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={deleting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deleting ? "Deleting..." : "Delete"}
                </Button>
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"></DialogOverlay>
                <DialogContent className="fixed top-1/2 left-1/2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl transform -translate-x-1/2 -translate-y-1/2 border max-w-md w-full mx-4 z-50">
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Confirm Delete
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-300 mb-4">
                        Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{freeFormList[index].label}"</strong>? This action cannot be undone.
                    </DialogDescription>
                    <div className="flex justify-end gap-3">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={deleting}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                    {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}

type LabelMenuProps = {
    freeFormList: freeFormEntry[];
    setFreeFormList: React.Dispatch<React.SetStateAction<freeFormEntry[]>>;
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
    label: string;
    setLabel: React.Dispatch<React.SetStateAction<string>>;
    user: User | null;
};

function LabelMenu({freeFormList, setFreeFormList, text, setText, label, setLabel, user}: LabelMenuProps) {
    // Show a menu of the user's past free-form text submissions by their labels.
    // Clicking on a single label populates the free-form text field with that submission.
    const [isOpen, setIsOpen] = React.useState(false);
    
    async function handleClick(event: React.MouseEvent<HTMLButtonElement>, index: number) {
        // Prevent the browser from reloading the page
        event.preventDefault();
        // Fill the text field with the previous submission's contents
        setText(freeFormList[index].text);
        setLabel(freeFormList[index].label);
    }
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-full"
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Past Submissions
                            </h2>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                {isOpen ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        Hide
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        Show ({freeFormList.length})
                                    </>
                                )}
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </div>
                <CollapsibleContent>
                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                        {freeFormList.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                No past submissions yet. Create your first one below!
                            </p>
                        ) : (
                            freeFormList.map((submission, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <button 
                                                className="text-left w-full group"
                                                onClick={(event) => handleClick(event, index)}
                                            >
                                                <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                    {submission.label}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {submission.text.substring(0, 100)}...
                                                </p>
                                            </button>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <SubmissionDate dateSubmitted={submission.dateSubmitted} />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <DeleteButton index={index} freeFormList={freeFormList} setFreeFormList={setFreeFormList} user={user} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}

function formatDateTime(isoString: string): string {
    // console.log(isoString);
    const date = new Date(isoString);

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

type SubmissionDateProps = {
    dateSubmitted: Timestamp;
};

function SubmissionDate({dateSubmitted}: SubmissionDateProps) {
    const date = formatDateTime(dateSubmitted.toDate().toISOString());

    return (
        <span className="text-xs text-gray-500 dark:text-gray-400">
            {date}
        </span>
    );
}

export default function FreeFormPage() {
    // For checking whether the user is logged in and redirecting them accordingly
    const { user, loading } = useAuth();
    const router = useRouter();
    // For keeping track of submission status
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    // For keeping track of user submissions
    const [freeFormList, setFreeFormList] = useState<freeFormEntry[]>([]);
    // For keeping track of the editable text in the form
    const [text, setText] = useState("");
    const [label, setLabel] = useState("");

    useEffect(() => {
        if (!loading && user) {
            getFreeFormList().then((arr: freeFormEntry[]) => {
                if (arr) setFreeFormList([...arr]);
            })
        }
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        // Prevent the browser from reloading the page
        event.preventDefault();

        // Read the form data and then convert it to a JSON object
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries())

        // For debugging purposes
        // console.log(formJson);

        // Convert the object into a new free-form submission object 
        // and append it to the list of free-form submissions
        const newSubmission: freeFormEntry = {
            text: formJson.text as string,
            label: formJson.label as string,
            dateSubmitted: Timestamp.now()
        };

        // If the new submission's label matches a pre-existing submission, update it
        const sameLabelIdx = freeFormList.findIndex((entry) => entry.label === newSubmission.label);

        let newList = freeFormList;
        if (sameLabelIdx != -1) {
            // Update the pre-existing submission instead of 
            // appending a new one to the list, and save the changes to the database
            console.log(`Updating "${freeFormList[sameLabelIdx].label}"...`);
            newList[sameLabelIdx] = newSubmission;
        } else {
            newList = [...freeFormList, newSubmission];
        }
        // For debugging purposes
        // console.log(newSubmission);

        setFreeFormList(newList);

        // Save updated submission list to the database
        submitNewList(newList);

        // Send AI prompt with text corpus and retrieve its response
        try {
            const AIResponse = await getAIResponse(AIPrompt, formJson.text as string);
            // For debugging purposes
            //console.log(AIResponse);

            // For debugging purposes
            // console.log(finalResponse);

            try {
                const responseObj = JSON.parse(AIResponse);
                // For debugging purposes
                // console.log(JSON.parse(AIResponse));
                saveAIResponse(responseObj, user, db);
            } catch (error) {
                console.error("Error parsing AI response: ", error);
            }
        } catch (error) {
            console.error("Error fetching AI response: ", error);
        }
    }

    async function submitNewList(newList: freeFormEntry[]) {
        if (!user) return;
        try {
            setSubmitting(true);
            setSubmitted(false);
            // Should overwrite the user's pre-existing array of submissions
            const newSubmissionRef = doc(db, "users", user.uid);
            await updateDoc(newSubmissionRef, { freeFormText: newList });
            setTimeout(() => setSubmitted(false), 3000); // reset after 3s
        } catch (error) {
            console.log("Failed to save.");
        } finally {
            setSubmitting(false);
            setSubmitted(true);
        }
    }

    async function getFreeFormList() {
        let freeFormList: freeFormEntry[] = [];
        if (user) {
            const documentRef = doc(db, "users", user.uid);
            const document = await getDoc(documentRef);
            const data = document.data();
            if (data?.freeFormText) {
                freeFormList = data.freeFormText.map((entry: any): freeFormEntry => ({
                    text: entry.text ?? "",
                    label: entry.label ?? "",
                    dateSubmitted: entry.dateSubmitted ?? new Timestamp(0, 0)
                }));
            }
        }
        // console.log(freeFormList);
        return freeFormList;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                    <Edit3 className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Free-Form Resume
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Past Submissions Panel */}
                <div className="lg:col-span-1">
                    <LabelMenu 
                        freeFormList={freeFormList} 
                        setFreeFormList={setFreeFormList} 
                        text={text} 
                        setText={setText} 
                        label={label} 
                        setLabel={setLabel} 
                        user={user}
                    />
                </div>

                {/* Main Writing Area */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Create New Content
                                </h2>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Label Input */}
                                <div className="space-y-2">
                                    <label htmlFor="label" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Title/Label
                                    </label>
                                    <input
                                        id="label"
                                        name="label"
                                        value={label}
                                        onChange={(event) => setLabel(event.target.value)}
                                        placeholder="Give your writing a descriptive title..."
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                        required
                                    />
                                </div>

                                {/* Text Area */}
                                <div className="space-y-2">
                                    <label htmlFor="text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Your Content
                                    </label>
                                    <textarea
                                        id="text"
                                        name="text"
                                        value={text}
                                        onChange={(event) => setText(event.target.value)}
                                        placeholder="Start writing your thoughts, experiences, or ideas here..."
                                        rows={15}
                                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                                    />
                                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                                        <span>{text.length} characters</span>
                                        <span>AI will process and enhance your content</span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={submitting || !text.trim() || !label.trim()}
                                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                                            submitted
                                                ? "bg-green-600 hover:bg-green-700 text-white"
                                                : submitting
                                                    ? "bg-gray-500 cursor-wait text-white"
                                                    : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                                        }`}
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                Processing...
                                            </>
                                        ) : submitted ? (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Saved!
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Submit & Enhance
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}