"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function FreeFormPage() {
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

    async function setFreeFormCorpus(corpus: string) {
        // We want to uniquely identify the user's free-form text in the database
        let uid;
        if (user) {
            uid = user.uid;
        } else {
            // Don't try to send anything if user is logged out
            return;
        }

        // Should overwrite the user's pre-existing submission
        const newSubmissionRef = doc(db, "users", uid);
        await setDoc(newSubmissionRef, {
            freeFormCorpus: corpus,
            dateSubmitted: serverTimestamp()
        });

        // For debugging purposes
        console.log("User    UID: ", user.uid);
        console.log("Document ID: ", newSubmissionRef.id);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
    }
    return (
        <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md">
                <form method="post" onSubmit={handleSubmit}>
                    <h1 className="text-2xl font-bold mb-6">Free-form Text</h1>
                    <textarea
                        name="text"
                        placeholder="Enter some text here. When you are done, hit 'Submit'."
                        rows={24}
                        cols={50}
                    ></textarea>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}