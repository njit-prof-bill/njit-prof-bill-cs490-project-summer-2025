"use client";
import { useState } from "react";
import { useAuth } from "@/context/authContext";

export default function BioUpload() {
  const [bioText, setBioText] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!bioText.trim()) {
      setStatus("Please enter your biography.");
      return;
    }

    if (!user?.uid) {
      setStatus("You must be signed in.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submitBio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          text: bioText,
        }),
      });

      const result = await res.json();
      setStatus(result.message);
    } catch (err) {
      console.error(err);
      setStatus("Error submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={bioText}
        onChange={(e) => setBioText(e.target.value)}
        placeholder="Write your biography here..."
        className="w-full p-2 border rounded text-sm h-40 resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
      {status && <p className="text-sm text-green-600">{status}</p>}
    </div>
  );
}
