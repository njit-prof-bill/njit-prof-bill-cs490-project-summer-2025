"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, addDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAIResponse, AIPrompt } from "@/components/ai/aiPrompt";

export default function FreeFormPage() {
    // For checking whether the user is logged in and redirecting them accordingly
    const { user, loading } = useAuth();
    const router = useRouter();
    // For retrieving any free-form text the user entered in the past (if it exists)
    const [corpusValue, setCorpusValue] = useState("");

    useEffect(() => {
        if (!loading && user) {
            // Retrieve the user's pre-existing free-form text (if it exists)
            getFreeFormCorpus().then((corpus) => {
                if (corpus) {
                    setCorpusValue(corpus);
                }
            });
        }
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }

    async function setFreeFormCorpus(corpus: string) {
        // Documents are identified in the database by the user's UID
        let uid;
        if (user) {
            uid = user.uid;
        } else {
            // Don't try to send anything if user is logged out
            return;
        }

        // Should overwrite the user's pre-existing submission
        const newSubmissionRef = doc(db, "users", uid);
        await updateDoc(newSubmissionRef, { freeFormText: { text: corpus } });

        // For debugging purposes
        //console.log("User    UID: ", user.uid);
        //console.log("Document ID: ", newSubmissionRef.id);
    }

    async function getFreeFormCorpus() {
        // Retrieve the user's pre-existing free-form text (if it exists)
        let corpus = "";
        let uid;
        if (user) {
            // Documents are identified in the database by the user's UID
            uid = user.uid;
        } else {
            // Don't try to retrieve anything if the user is logged out
            return corpus;
        }
        const documentRef = doc(db, "users", uid);
        const document = await getDoc(documentRef);
        if (!document.exists) {
            return corpus;
        }
        const data = document.data();
        // Check if the data exists before attempting to parse it
        if (data && typeof data.freeFormText.text === "string") {
            corpus = data.freeFormText.text;
        }
        return corpus;
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        // Prevent the browser from reloading the page
        event.preventDefault();

        // Read the form data and then convert it to a JSON object
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries())

        // Send the form data to the database
        setFreeFormCorpus(formJson.text as string);

        // For debugging purposes
        //console.log(formJson);

        // Send AI prompt with text corpus and retrieve its response
        try {
            const AIResponse = await getAIResponse(AIPrompt, formJson.text as string);
            console.log(AIResponse);
        } catch (error) {
            console.error("Error fetching AI response: ", error);
        }
        
    }
    return (
        <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md">
                <form method="post" onSubmit={handleSubmit}>
                    <h1 className="text-2xl font-bold mb-6">Free-form Text</h1>
                    <p>Enter some text in the box below. <br></br>When you are done, hit 'Submit'.</p>
                    <textarea
                        name="text"
                        // Using defaultValue since I just want to pre-fill the text field once
                        // with whatever the user entered there in a past session,
                        // instead of updating the field while the user is typing in it.
                        defaultValue={corpusValue}
                        placeholder="Start typing here"
                        rows={24}
                        cols={50}
                    ></textarea>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}