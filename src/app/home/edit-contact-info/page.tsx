"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditContactInfoPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            loadData();
        }
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    async function loadData() {
        const documentRef = doc(db, "users", user!.uid);
        const document = await getDoc(documentRef);
        if (document.exists()) {
            const data = document.data();
            setFullName(data?.resumeFields?.fullName ?? "");
            setEmail(data?.resumeFields?.contact?.email ?? "");
            setLocation(data?.resumeFields?.contact?.location ?? "");
            setPhone(data?.resumeFields?.contact?.phone ?? "");
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        setSubmitted(false);

        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            "resumeFields.fullName": fullName,
            "resumeFields.contact.email": email,
            "resumeFields.contact.location": location,
            "resumeFields.contact.phone": phone,
        });

        setSubmitting(false);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000); // reset after 3s
    }

    if (loading) return <p>Loading...</p>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6">
            <h2 className="text-l font-bold">Full Name:</h2>
            <input
                type="text"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name here"
                className="border p-2 rounded w-full"
            />

            <h2 className="text-l font-bold">Email Address:</h2>
            <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address here"
                className="border p-2 rounded w-full"
            />

            <h2 className="text-l font-bold">Phone Number (Format: 123-456-7890):</h2>
            <input
                type="tel"
                name="phone"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your number here"
                className="border p-2 rounded w-full"
            />

            <h2 className="text-l font-bold">Location:</h2>
            <input
                type="text"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location here"
                className="border p-2 rounded w-full"
            />

            <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 rounded text-white font-semibold transition duration-300 ${
                    submitted
                        ? "bg-blue-600 cursor-not-allowed"
                        : submitting
                        ? "bg-gray-500 cursor-wait"
                        : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
            >
                {submitting ? "Submitting..." : submitted ? "Submitted!" : "Submit"}
            </button>
        </form>
    );
}
