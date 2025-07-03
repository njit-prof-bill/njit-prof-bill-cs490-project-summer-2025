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
  const [formChanged, setFormChanged] = useState(false); //for unsaved changes check
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
    setFormChanged(false);  // Lets page know change has been saved
    setTimeout(() => setStatusMessage(null), 1); // Removes "unsaved change" from page
  }

  useEffect(() => {
    //handles reload and close tab if there are unsaved changes
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (formChanged) {
        event.preventDefault();
        event.returnValue = ''; //is deprecated but might be necessary to prompt on Chrome
      }
    };

    //handles (most) clicks on links within the page if there are unsaved changes
    const handleClick = (event: MouseEvent) => {
      if (!formChanged) return;

      const nav = document.querySelector('nav');
      if (nav && nav.contains(event.target as Node)) {
        const target = (event.target as HTMLElement).closest('a');
        if (target && target instanceof HTMLAnchorElement) {
          const confirmed = window.confirm('You have unsaved changes. Leave this page?');
          if (!confirmed) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        }
      }

      const header = document.querySelector('header');
      if (header && header.contains(event.target as Node)) {
        const target = (event.target as HTMLElement).closest('a');
        if (target && target instanceof HTMLAnchorElement) {
          const confirmed = window.confirm('You have unsaved changes. Leave this page?');
          if (!confirmed) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [formChanged]);

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
            placeholder="Enter your professional summary (or your career objectives) here"
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              setFormChanged(true);
              setStatusMessage("There has been a change. Don't forget to save!");
            }}
            rows={6}
            className="w-full p-3 border border-gray-300 rounded-md mb-4"
          />
          {statusMessage == "There has been a change. Don't forget to save!" && <p className="mt-2 text-sm text-yellow-400">{statusMessage}</p>}
          <br />
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