"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

type EducationEntry = {
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    gpa: string;
};

type EducationFormProps = {
    educationList: EducationEntry[];
    setEducationList: React.Dispatch<React.SetStateAction<EducationEntry[]>>;
    user: any;
}

function educationForm({ educationList, setEducationList, user }: EducationFormProps) {
    ;
}

export default function EditEducationPage() {
    // For checking whether the user is logged in and redirecting them accordingly
    const { user, loading } = useAuth();
    const router = useRouter();
    const [ education, setEducation ] = useState<EducationEntry[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }

    return (
        <div>
            <h1>Edit Education</h1>
        </div>
    );
}