"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditResumeFieldsPage() {
    // For checking whether the user is logged in and redirecting them accordingly
    const { user, loading } = useAuth();
    const router = useRouter();
    // For retrieving professional summary from user's profile
    const [ summary, setSummary ] = useState("");
    // For retrieving the user's full name (as parsed from their resume)
    const [ fullName, setFullName ] = useState("");
    // For retrieving the user's email address (as parsed from their resume)
    const [ email, setEmail ] = useState("");
    // For retrieving the user's location (as parsed from their resume)
    const [ location, setLocation ] = useState("");
    
    useEffect(() => {
        if (!loading && user) {
            getSummary().then((text) => {
                if (text) {
                    setSummary(text);
                }
            });
            getFullName().then((text) => {
                if (text) {
                    setFullName(text);
                }
            });
            getEmail().then((text) => {
                if (text) {
                    setEmail(text);
                }
            });
            getLocation().then((text) => {
                if (text) {
                    setLocation(text);
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

    async function getSummary() {
        // Retrieve the user's professional summary (if it exists)
        let text = "";
        if (user) {
            const documentRef = doc(db, "users", user.uid);
            const document = await getDoc(documentRef);
            if (!document.exists) {
                return text;
            }
            const data = document.data();
            if (data && typeof data.resumeFields.summary === "string") {
                text = data.resumeFields.summary;
            }
        }
        return text;
    }

    async function getFullName() {
        // Retrieve the user's full name (from info parsed from their resume, not the logged-in account)
        let text = "";
        if (user) {
            const documentRef = doc(db, "users", user.uid);
            const document = await getDoc(documentRef);
            if (!document.exists) {
                return text;
            }
            const data = document.data();
            if (data && typeof data.resumeFields.fullName === "string") {
                text = data.resumeFields.fullName;
            }
        }
        return text;
    }
    async function getEmail() {
        // Retrieve the user's email address (from info parsed from their resume, not the logged-in account)
        let text = "";
        if (user) {
            const documentRef = doc(db, "users", user.uid);
            const document = await getDoc(documentRef);
            if (!document.exists) {
                return text;
            }
            const data = document.data();
            if (data && typeof data.resumeFields.contact.email === "string") {
                text = data.resumeFields.contact.email;
            }
        }
        return text;
    }
    async function getLocation() {
        // Retrieve the user's email address (from info parsed from their resume)
        let text = "";
        if (user) {
            const documentRef = doc(db, "users", user.uid);
            const document = await getDoc(documentRef);
            if (!document.exists) {
                return text;
            }
            const data = document.data();
            if (data && typeof data.resumeFields.contact.location === "string") {
                text = data.resumeFields.contact.location;
            }
        }
        return text;
    }
    async function submitSummary(text: string) {
        // User profiles are identified in the database by the user's UID
        if (user) {
            const newSummaryRef = doc(db, "users", user.uid);
            await updateDoc(newSummaryRef, { "resumeFields.summary": text });
        }
    }

    async function submitFullName(text: string) {
        // User profiles are identified in the database by the user's UID
        if (user) {
            const newSummaryRef = doc(db, "users", user.uid);
            await updateDoc(newSummaryRef, { "resumeFields.fullName": text });
        }
    }

    async function submitEmail(text: string) {
        // User profiles are identified in the database by the user's UID
        if (user) {
            const newSummaryRef = doc(db, "users", user.uid);
            await updateDoc(newSummaryRef, { "resumeFields.contact.email": text });
        }
    }

    async function submitLocation(text: string) {
        // User profiles are identified in the database by the user's UID
        if (user) {
            const newSummaryRef = doc(db, "users", user.uid);
            await updateDoc(newSummaryRef, { "resumeFields.contact.location": text });
        }
    }
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        // Prevent the browser from reloading the page
        event.preventDefault();

        // Read form data and convert it to an object
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const formObj = Object.fromEntries(formData.entries());

        // For debugging purposes
        //console.log(formObj);

        // Send the new summary to the database
        submitSummary(formObj.summary as string);
        // Send the new contact info to the database
        submitFullName(formObj.fullName as string);
        submitEmail(formObj.email as string);
        submitLocation(formObj.location as string);
    }
    return (
        <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Edit Resume Info</h1>
                <form method="post" onSubmit={handleSubmit}>
                    <h2 className="text-l font-bold mb-6">Full Name:</h2>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name here"
                        defaultValue={fullName}>
                    </input>
                    <h2 className="text-l font-bold mb-6">Email Address:</h2>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email address here"
                        defaultValue={email}
                    ></input>
                    <h2 className="text-l font-bold mb-6">Phone Number (Format: 123-456-7890):</h2>
                    <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="Enter your number here"
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                    ></input>
                    <h2 className="text-l font-bold mb-6">Location:</h2>
                    <input
                        type="text"
                        name="location"
                        placeholder="Enter your location here"
                        defaultValue={location}
                    ></input>
                    <h2 className="text-l font-bold mb-6">Professional Summary:</h2>
                    <textarea
                        name="summary"
                        placeholder="Enter your professional summary here"
                        defaultValue={summary}
                        rows={4}
                        cols={50}
                    ></textarea>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}