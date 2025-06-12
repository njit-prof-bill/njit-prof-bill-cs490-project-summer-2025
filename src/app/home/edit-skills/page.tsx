"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditSkillsPage() {
    // For checking whether the user is logged in and redirecting them accordingly
    const { user, loading } = useAuth();
    const router = useRouter();
    const [ skills, setSkills ] = useState<string[]>([]);

    useEffect(() => {
        if (!loading && user) {
            getSkills().then((arr: string[]) => {
                setSkills([...arr]);
            });
        }
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }

    async function getSkills() {
        // Retrieve the list of user's skills
        let skillList: string[] = [];
        if (user) {
            const documentRef = doc(db, "users", user.uid);
            const document = await getDoc(documentRef);
            if (!document.exists) {
                return skillList;
            }
            const data = document.data();
            if (
                data 
                && Array.isArray(data.resumeFields.skills)
                //&& data.resumeFields.skills.every((item) => typeof item === "string")
            ) {
                // Want a copy of the array, not a reference to it
                skillList = [...data.resumeFields.skills];
            }
        }
        return skillList;
    }

    // function testGetSkills() {
    //     console.log(skills);
    // }

    return (
        <div>
            <h1>Skills</h1>
            {/* <button onClick={testGetSkills}>Click me</button> */}
        </div>
    );
}