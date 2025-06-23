"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ref, list } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function ViewPastUploadsPage() {
    // For checking whether the user is logged in and redirecting them accordingly
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            listFiles();
        }
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    async function listFiles() {
        if (!user) return;
        try {
            const listRef = ref(storage, `users/${user.uid}`);
            const firstPage = await list(listRef, { maxResults: 10 });

            const fileNames = firstPage.items.map((itemRef) => {
                return itemRef.name;
            })

            console.log(fileNames);
        } catch (error) {
            console.error("Error listing files: ", error);
        }
    }

    return (
        <div>
            <h1>View Past Uploads</h1>
        </div>
    );
}