"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { 
    FileText, 
    Save, 
    AlertCircle,
    CheckCircle,
    User,
    Edit3,
    Target
} from "lucide-react";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Professional Summary
          </h1>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Edit3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Professional Summary
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Summary Textarea */}
          <div className="space-y-2">
            <label htmlFor="summary" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Professional Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              placeholder="Write a compelling professional summary that highlights your experience, skills, and career objectives. This should be a brief overview of who you are professionally and what you bring to the table..."
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                setFormChanged(true);
                setStatusMessage("There has been a change. Don't forget to save!");
              }}
              rows={8}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{summary.length} characters</span>
              <span>Aim for 3-5 sentences that capture your professional essence</span>
            </div>
          </div>

          {/* Status Messages */}
          {statusMessage === "There has been a change. Don't forget to save!" && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{statusMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={submitting || !summary.trim()}
              className={`px-8 py-3 font-medium flex items-center gap-2 ${
                submitted
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : submitting
                    ? "bg-gray-500 cursor-wait text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : submitted ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Summary
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}