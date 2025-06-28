"use client";
import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

import { collection, addDoc } from "firebase/firestore";



export default function JobDescriptionUpload() {
  const [jobText, setJobText] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!jobText.trim()) {
      setStatus("Please enter a job description.");
      return;
    }

    if (!user?.uid) {
      setStatus("You must be signed in.");
      return;
    }

    setIsSubmitting(true);
    try {
      // const docRef = doc(firestore, "users", user.uid, "userDocuments", "jobDescriptionText");

      // const docRef = doc(firestore, "users", user.uid, "userJobDescriptions");
      const userJobDescriptionsRef = collection(firestore, "users", user.uid, "userJobDescriptions");

      // await addDoc(userJobDescriptionsRef, { text: jobText });

      await addDoc(userJobDescriptionsRef, {
        text: jobText,
        createdAt: new Date(),
      });

      setStatus("Job description saved successfully.");
    } catch (err) {
      console.error(err);
      setStatus("Error submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };




  return (
  <div className="w-full px-0 pb-0">
    <div className="flex flex-col gap-3 w-full">
      <textarea
        value={jobText}
        onChange={(e) => setJobText(e.target.value)}
        placeholder="Paste or type the job ad here..."
        className="w-full p-3 rounded-md bg-zinc-900 text-white border border-zinc-700 resize-none h-72"

      />
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded transition"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
      {status && (
        <p className={`text-sm ${status.includes("Error") ? "text-red-500" : "text-green-500"}`}>
          {status}
        </p>
      )}
    </div>
  </div>
  );
}
