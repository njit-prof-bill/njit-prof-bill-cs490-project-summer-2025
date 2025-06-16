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
};

function EducationForm({ educationList, setEducationList, user }: EducationFormProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData.entries());

    let num_entries = Object.keys(formObj).length;
    if (num_entries % 5 !== 0) return;
    num_entries = num_entries / 5;

    const eduFields = ["degree", "institution", "startDate", "endDate", "gpa"] as const;
    const newEduList: EducationEntry[] = [];

    for (let i = 0; i < num_entries; i++) {
      const entry: EducationEntry = {
        degree: formObj[`degree_${i}`] as string,
        institution: formObj[`institution_${i}`] as string,
        startDate: formObj[`startDate_${i}`] as string,
        endDate: formObj[`endDate_${i}`] as string,
        gpa: formObj[`gpa_${i}`] as string,
      };
      newEduList.push(entry);
    }

    submitEduList(newEduList);
  }

  async function submitEduList(newEduList: EducationEntry[]) {
    if (!user) return;
    try {
      setIsSubmitting(true);
      const newEduRef = doc(db, "users", user.uid);
      await updateDoc(newEduRef, { "resumeFields.education": newEduList });
      setStatusMessage("Saved!");
      setTimeout(() => setStatusMessage(null), 2000);
    } catch (error) {
      setStatusMessage("Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function addNewEdu(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setEducationList((oldEdu) => [...oldEdu, {
      degree: "", institution: "", startDate: "", endDate: "", gpa: ""
    }]);
  }

  function removeEdu(event: React.MouseEvent<HTMLButtonElement>, index: number) {
    event.preventDefault();
    setEducationList((oldEdu) => oldEdu.filter((_, i) => i !== index));
  }

  return (
    <div>
      <form method="post" onSubmit={handleSubmit}>
        {educationList.map((entry, index) => (
          <div key={index} className="mb-4 border p-4 rounded-lg shadow-sm">
            <h3>Degree Name:</h3>
            <input
              type="text"
              id={`degree_${index}`}
              name={`degree_${index}`}
              value={entry.degree}
              placeholder="Enter degree name"
              onChange={(e) => {
                const updated = { ...entry, degree: e.target.value };
                const list = [...educationList];
                list[index] = updated;
                setEducationList(list);
              }}
              className="mb-2 w-full p-2 border rounded"
            />
            <h3>Institution:</h3>
            <input
              type="text"
              id={`institution_${index}`}
              name={`institution_${index}`}
              value={entry.institution}
              placeholder="Enter institution name"
              onChange={(e) => {
                const updated = { ...entry, institution: e.target.value };
                const list = [...educationList];
                list[index] = updated;
                setEducationList(list);
              }}
              className="mb-2 w-full p-2 border rounded"
            />
            <h3>Start Date:</h3>
            <input
              type="text"
              id={`startDate_${index}`}
              name={`startDate_${index}`}
              value={entry.startDate}
              placeholder="Enter start date"
              pattern="\d{4}-\d{2}"
              title="Format should be: YYYY-MM"
              onChange={(e) => {
                const updated = { ...entry, startDate: e.target.value };
                const list = [...educationList];
                list[index] = updated;
                setEducationList(list);
              }}
              className="mb-2 w-full p-2 border rounded"
            />
            <h3>End Date:</h3>
            <input
              type="text"
              id={`endDate_${index}`}
              name={`endDate_${index}`}
              value={entry.endDate}
              placeholder="Enter end date"
              pattern="(\d{4}-\d{2}|Present)"
              title="Format should be: YYYY-MM or just write 'Present'"
              onChange={(e) => {
                const updated = { ...entry, endDate: e.target.value };
                const list = [...educationList];
                list[index] = updated;
                setEducationList(list);
              }}
              className="mb-2 w-full p-2 border rounded"
            />
            <h3>GPA:</h3>
            <input
              type="text"
              id={`gpa_${index}`}
              name={`gpa_${index}`}
              value={entry.gpa}
              placeholder="Enter GPA"
              onChange={(e) => {
                const updated = { ...entry, gpa: e.target.value };
                const list = [...educationList];
                list[index] = updated;
                setEducationList(list);
              }}
              className="mb-2 w-full p-2 border rounded"
            />
            <button
              onClick={(event) => removeEdu(event, index)}
              className="bg-red-500 text-white px-3 py-1 mt-2 rounded hover:bg-red-600 cursor-pointer"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addNewEdu}
          className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600 cursor-pointer"
        >
          Add New Education
        </button>
        <br />
        <button
          type="submit"
          className="submit-button bg-green-500 text-white px-6 py-2 mt-4 rounded hover:bg-green-600 cursor-pointer disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        {statusMessage && <p className="mt-2 text-sm text-green-700">{statusMessage}</p>}
      </form>
    </div>
  );
}

export default function EditEducationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [education, setEducation] = useState<EducationEntry[]>([]);

  useEffect(() => {
    if (!loading && user) {
      getEducation().then((arr: EducationEntry[]) => {
        if (arr) setEducation([...arr]);
      });
    }
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function getEducation(): Promise<EducationEntry[]> {
    let educationList: EducationEntry[] = [];
    
    if (user) {
        const documentRef = doc(db, "users", user.uid);
        const document = await getDoc(documentRef);
        const data = document.data();
        if (data?.resumeFields?.education) {
            educationList = data.resumeFields.education.map((entry: any): EducationEntry => ({
            degree: entry.degree ?? "",
            institution: entry.institution ?? "",
            startDate: entry.startDate ?? "",
            endDate: entry.endDate ?? "",
            gpa: entry.gpa ?? ""
            }
        ));
}
    }
    return educationList;
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold mb-4">Edit Education</h1>
                <EducationForm educationList={education} setEducationList={setEducation} user={user} />
        </div>
    </div>
  );
}