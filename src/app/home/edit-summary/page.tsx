"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditSummaryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      getSummary().then((text) => {
        if (text) {
          setSummary(text);
        }
      });
    }
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function getSummary() {
    let text = "";
    if (user) {
      const documentRef = doc(db, "users", user.uid);
      const document = await getDoc(documentRef);
        const data = document.data();
        if (data && typeof data.resumeFields?.summary === "string") {
          text = data.resumeFields.summary;
        }
    }
    return text;
  }

  async function submitSummary(text: string) {
    if (!user) return;
    setSubmitting(true);
    setSubmitted(false);
    const newSummaryRef = doc(db, "users", user.uid);
    await updateDoc(newSummaryRef, { "resumeFields.summary": text });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000); // reset after 3s
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData.entries());

    const text = (formObj.summary as string).trim();
    setSummary(text);
    submitSummary(text);
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Edit Professional Summary</h1>
        <form method="post" onSubmit={handleSubmit}>
          <textarea
            name="summary"
            placeholder="Enter your professional summary here"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={6}
            className="w-full p-3 border border-gray-300 rounded-md mb-4"
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
      </div>
    </div>
  );
}
