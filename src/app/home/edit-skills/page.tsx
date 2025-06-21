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

function SkillsForm({ skillsList, setSkillsList, user }: SkillsFormProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function moveSkillUp(index: number) {
    if (index === 0) return;
    const newList = [...skillsList];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setSkillsList(newList);
  }

  function moveSkillDown(index: number) {
    if (index === skillsList.length - 1) return;
    const newList = [...skillsList];
    [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    setSkillsList(newList);
  }


  async function submitSkills(skills: string[]) {
    if (!user) return;
    try {
      setIsSubmitting(true);
      const newSkillsRef = doc(db, "users", user.uid);
      await updateDoc(newSkillsRef, { "resumeFields.skills": skills });
      setStatusMessage("Saved!");
      setTimeout(() => setStatusMessage(null), 2000);
    } catch (error) {
      setStatusMessage("Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData.entries());

    let skillsArr = [...new Set(Object.values(formObj).map(String))];
    skillsArr = skillsArr.filter((str) => str.trim() !== "");

    setSkillsList(skillsArr);
    submitSkills(skillsArr);
  }

  function addNewSkill(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setSkillsList((oldSkills) => [...oldSkills, ""]);
  }

  function removeSkill(event: React.MouseEvent<HTMLButtonElement>, index: number) {
    event.preventDefault();
    setSkillsList((oldSkills) => oldSkills.filter((_, i) => i !== index));
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
          <div key={index} className="mb-2 flex items-center gap-2">
            <div className="flex flex-col space-y-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  moveSkillUp(index);
                }}
                className="bg-gray-400 text-white px-2 rounded hover:bg-gray-500 disabled:opacity-50 cursor-pointer"
                disabled={index === 0}
                title="Move Up"
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  moveSkillDown(index);
                }}
                className="bg-gray-400 text-white px-2 rounded hover:bg-gray-500 disabled:opacity-50 cursor-pointer"
                disabled={index === skillsList.length - 1}
                title="Move Down"
              >
                ↓
              </button>
            </div>
            <input
              type="text"
              id={index.toString()}
              name={`skill-${index}`}
              placeholder="Enter a skill here"
              value={field}
              onChange={(event) => handleChange(index, event.target.value)}
              className="flex-grow p-2 border rounded"
            />
            <button
              onClick={(event) => removeSkill(event, index)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={addNewSkill}
          className="bg-blue-500 text-white px-4 py-2 mt-2 rounded hover:bg-blue-600 cursor-pointer"
        >
          Add New Skill
        </button>
        <br />
        <button
          type="submit"
          className="bg-green-500 text-white px-6 py-2 mt-4 rounded hover:bg-green-600 cursor-pointer disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        {statusMessage && <p className="mt-2 text-sm text-green-700">{statusMessage}</p>}
      </form>
    </div>
  );
}

export default function EditSkillsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && user) {
      getSkills().then((arr: string[]) => setSkills([...arr]));
    }
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function getSkills() {
    let skillList: string[] = [];
    if (user) {
      const documentRef = doc(db, "users", user.uid);
      const document = await getDoc(documentRef);
      const data = document.data();
      if (data && Array.isArray(data.resumeFields?.skills)) {
        skillList = [...data.resumeFields.skills];

      }
    }
    return skillList;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Edit Skills</h1>
        <SkillsForm skillsList={skills} setSkillsList={setSkills} user={user} />
      </div>
    </div>
  );
}
