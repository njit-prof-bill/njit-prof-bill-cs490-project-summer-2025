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

function EducationForm({ educationList, setEducationList, user }: EducationFormProps) {
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        // Prevent browser from reloading page
        event.preventDefault();
    }
    function addNewEdu(event: React.MouseEvent<HTMLButtonElement>) {
        // Prevent browser from reloading page
        event.preventDefault();
        // Add a new, empty education entry to the array
        let newEduEntry: EducationEntry = {
            degree: "",
            institution: "",
            startDate: "",
            endDate: "",
            gpa: ""
        };
        setEducationList((oldEdu) => [...oldEdu, newEduEntry]);
    }
    function removeEdu(event: React.MouseEvent<HTMLButtonElement>, index: number) {
        // Prevent browser from reloading page
        event.preventDefault();
        // Remove the education entry from the array
        setEducationList((oldEdu) => oldEdu.filter((currEdu, i) => i !== index));
    }
    return (
        <div>
            <form method="post" onSubmit={handleSubmit}>
                {educationList.map((entry, index) => (
                    <div key={index}>
                        <h3>Degree Name:</h3>
                        <input
                            type="text"
                            id={`degree-${index}`}
                            name={`degree-${index}`}
                            placeholder="Enter degree name here"
                            value={entry.degree}
                            onChange={(event) => {
                                const updatedEntry = {...entry, degree: event.target.value};
                                const updatedList = [...educationList];
                                updatedList[index] = updatedEntry;
                                setEducationList(updatedList);
                            }}
                            size={40}
                        ></input><br></br>
                        <h3>Institution:</h3>
                        <input
                            type="text"
                            id={`institution-${index}`}
                            name={`institution-${index}`}
                            placeholder="Enter institution name here"
                            value={entry.institution}
                            onChange={(event) => {
                                const updatedEntry = {...entry, institution: event.target.value};
                                const updatedList = [...educationList];
                                updatedList[index] = updatedEntry;
                                setEducationList(updatedList);
                            }}
                            size={40}
                        ></input>
                        <h3>Start Date:</h3>
                        <input
                            type="text"
                            id={`startdate-${index}`}
                            name={`startdate-${index}`}
                            placeholder="Enter start date here"
                            value={entry.startDate}
                            onChange={(event) => {
                                const updatedEntry = {...entry, startDate: event.target.value};
                                const updatedList = [...educationList];
                                updatedList[index] = updatedEntry;
                                setEducationList(updatedList);
                            }}
                            size={40}
                        ></input>
                        <h3>End Date:</h3>
                        <input
                            type="text"
                            id={`enddate-${index}`}
                            name={`enddate-${index}`}
                            placeholder="Enter end date here"
                            value={entry.endDate}
                            onChange={(event) => {
                                const updatedEntry = {...entry, endDate: event.target.value};
                                const updatedList = [...educationList];
                                updatedList[index] = updatedEntry;
                                setEducationList(updatedList);
                            }}
                            size={40}
                        ></input><br></br>
                        <h3>GPA:</h3>
                        <input
                            type="text"
                            id={`gpa-${index}`}
                            name={`gpa-${index}`}
                            placeholder="Enter GPA here"
                            value={entry.gpa}
                            onChange={(event) => {
                                const updatedEntry = {...entry, gpa: event.target.value};
                                const updatedList = [...educationList];
                                updatedList[index] = updatedEntry;
                                setEducationList(updatedList);
                            }}
                            size={40}
                        ></input><br></br>
                        <button onClick={(event) => removeEdu(event, index)}>Remove</button>
                    </div>
                ))}
                <button onClick={addNewEdu}>Add New Education</button><br></br>
                <button type="submit">Save</button>
            </form>
        </div>
    );
}

export default function EditEducationPage() {
    // For checking whether the user is logged in and redirecting them accordingly
    const { user, loading } = useAuth();
    const router = useRouter();
    const [ education, setEducation ] = useState<EducationEntry[]>([]);

    useEffect(() => {
        if (!loading && user) {
            getEducation().then((arr: Array<EducationEntry>) => {
                if (arr) {
                    setEducation([...arr]);
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

    async function getEducation() {
        // Retrieve the user's list of educational credentials from the database
        let educationList = new Array<EducationEntry>();
        if (user) {
            const documentRef = doc(db, "users", user.uid);
            const document = await getDoc(documentRef);
            if (!document.exists) {
                return educationList;
            }
            const data = document.data();
            if (
                data &&
                Array.isArray(data.resumeFields.education)
            ) {
                // Want a copy of the array, not a reference to it
                educationList = [...data.resumeFields.education];
            }
        }
        console.log(educationList);
        return educationList;
    }

    return (
        <div>
            <h1>Edit Education</h1>
            <EducationForm educationList={education} setEducationList={setEducation} user={user} />
        </div>
    );
}