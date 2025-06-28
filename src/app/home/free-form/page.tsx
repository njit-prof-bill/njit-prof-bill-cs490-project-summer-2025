"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, addDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { getAIResponse, saveAIResponse, AIPrompt } from "@/components/ai/aiPrompt";
import { User } from "firebase/auth";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { date } from "zod";

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
                <button type="button" disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete"}
                </button>
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50"></DialogOverlay>
                <DialogContent className="fixed top-1/2 left-1/2 bg-white p-4 rounded shadow transform -translate-x-1/2 -translate-y-1/2">
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{freeFormList[index].label}</strong>?;
                    </DialogDescription>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                            {deleting ? "Deleting..." : "Yes, Delete"}
                        </button>
                        <DialogClose asChild>
                            <button className="bg-gray-300 px-2 py-1 rounded" disabled={deleting}>
                                Cancel
                            </button>
                        </DialogClose>
                    </div>
                    {error && <div className="mt-2 text-red-500">{error}</div>}
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
    async function handleClick(event: React.MouseEvent<HTMLButtonElement>, index: number) {
        // Prevent the browser from reloading the page
        event.preventDefault();
        // Fill the text field with the previous submission's contents
        setText(freeFormList[index].text);
        setLabel(freeFormList[index].label);
    }
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Load Past Submissions:</h1>
            {freeFormList.map((submission, index) => (
                <div key={index}>
                    <button
                        onClick={(event) => handleClick(event, index)}
                    >
                        {submission.label}
                    </button>
                    <SubmissionDate dateSubmitted={submission.dateSubmitted} />
                    <DeleteButton index={index} freeFormList={freeFormList} setFreeFormList={setFreeFormList} user={user} />
                </div>
            ))}
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
        <div>
            <p>Modified: {date}</p>
        </div>
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
        <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md">
                <LabelMenu freeFormList={freeFormList} setFreeFormList={setFreeFormList} text={text} setText={setText} label={label} setLabel={setLabel} user={user}/>
                <h1 className="text-2xl font-bold mb-6">Free-form Text</h1>
                <form method="post" onSubmit={handleSubmit}>
                    <p>Enter some text in the box below. <br></br>When you are done, hit 'Submit'.</p>
                    <textarea
                        name="text"
                        // Using defaultValue since I just want to pre-fill the text field once
                        // with whatever the user entered there in a past session,
                        // instead of updating the field while the user is typing in it.
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="Start typing here"
                        rows={15}
                        className="w-full p-3 border border-gray-300 rounded-md mb-4"
                    ></textarea>
                    <input
                        name="label"
                        value={label}
                        onChange={(event) => setLabel(event.target.value)}
                        placeholder="Enter a label for this submission"
                        className="w-full p-3 border border-gray-300 rounded-md mb-4"
                        required
                    ></input>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`px-4 py-2 rounded text-white font-semibold transition duration-300 ${submitted
                                ? "bg-blue-600 cursor-not-allowed"
                                : submitting
                                    ? "bg-gray-500 cursor-wait"
                                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                    >
                        {submitting ? "Submitting..." : submitted ? "Submitted!" : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
}