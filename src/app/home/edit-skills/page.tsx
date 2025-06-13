"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

type SkillsFormProps = {
    skillsList: string[];
    setSkillsList: React.Dispatch<React.SetStateAction<string[]>>;
    user: any;
};

function SkillsForm({skillsList, setSkillsList, user}: SkillsFormProps) {
    async function submitSkills(skills: string[]) {
        // User profiles are identified in the database by the user's UID
        if (user) {
            const newSkillsRef = doc(db, "users", user.uid);
            await updateDoc(newSkillsRef, { "resumeFields.skills": skills });
        }
    }
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        // Prevent browser from reloading page
        event.preventDefault();

        // Read form data and convert to object
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const formObj = Object.fromEntries(formData.entries());

        // For debugging purposes
        console.log(formObj);

        // Convert the object back into an array of strings,
        // ignoring any duplicate strings by using Set()
        const skillsArr = [...new Set(Object.values(formObj).map(String))];

        // For debugging purposes
        console.log(skillsArr);

        // Update the form to remove duplicates
        setSkillsList(skillsArr);

        // Submit the array to the user's document in the database
        submitSkills(skillsArr);
    }
    function addNewSkill(event: React.MouseEvent<HTMLButtonElement>) {
        // Prevent browser from reloading page
        event.preventDefault();
        // Add a new, empty string to the array
        setSkillsList((oldSkills) => [...oldSkills, ""]);
    }
    function removeSkill(event: React.MouseEvent<HTMLButtonElement>, index: number) {
        // Prevent browser from reloading page
        event.preventDefault();
        // Remove the element from the array
        setSkillsList((oldSkills) => oldSkills.filter((currSkill, i) => i !== index));
    }
    function handleChange(index: number, value: string) {
        setSkillsList((oldSkills) => 
            oldSkills.map((skill, i) => (i === index ? value : skill))
        );
    }
    return (
        <div>
            <form method="post" onSubmit={handleSubmit}>
                {skillsList.map((field, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            id={index.toString()}
                            name={`skill-${index}`}
                            placeholder="Enter a skill here"
                            value={field}
                            onChange={(event) => handleChange(index, event.target.value)}
                        ></input>
                        <button onClick={(event) => removeSkill(event, index)}>Remove</button>
                    </div>
                ))}
                <button onClick={addNewSkill}>Add New Skill</button><br></br>
                <button type="submit">Save</button>
            </form>
        </div>
    );
}

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

    return (
        <div>
            <h1>Skills</h1>
            <SkillsForm skillsList={skills} setSkillsList={setSkills} user={user} />
        </div>
    );
}