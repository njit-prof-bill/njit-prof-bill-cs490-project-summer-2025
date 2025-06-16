"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditContactInfoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      loadData();
    }
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function loadData() {
    const documentRef = doc(db, "users", user!.uid);
    const document = await getDoc(documentRef);
    if (document.exists()) {
      const data = document.data();
      setFullName(data?.resumeFields?.fullName ?? "");
      setEmail(data?.resumeFields?.contact?.email ?? "");
      setLocation(data?.resumeFields?.contact?.location ?? "");
      setPhone(data?.resumeFields?.contact?.phone ?? "");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setSubmitted(false);

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      "resumeFields.fullName": fullName,
      "resumeFields.contact.email": email,
      "resumeFields.contact.location": location,
      "resumeFields.contact.phone": phone,
    });

    setSubmitting(false);
    setSubmitted(true);
  }

  // Generic handler to update state and reset submitted status when user edits any input
  function handleInputChange(
    setter: React.Dispatch<React.SetStateAction<string>>
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (submitted) setSubmitted(false);
    };
  }

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6">
      <h2 className="text-l font-bold">Full Name:</h2>
      <input
        type="text"
        name="fullName"
        value={fullName}
        onChange={handleInputChange(setFullName)}
        placeholder="Enter your full name here"
        className="border p-2 rounded w-full"
      />

      <h2 className="text-l font-bold">Email Address:</h2>
      <input
        type="email"
        name="email"
        value={email}
        onChange={handleInputChange(setEmail)}
        placeholder="Enter your email address here"
        className="border p-2 rounded w-full"
      />

      <h2 className="text-l font-bold">Phone Number (Format: 123-456-7890):</h2>
      <input
        type="tel"
        name="phone"
        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
        value={phone}
        onChange={handleInputChange(setPhone)}
        placeholder="Enter your number here"
        className="border p-2 rounded w-full"
      />

      <h2 className="text-l font-bold">Location:</h2>
      <input
        type="text"
        name="location"
        value={location}
        onChange={handleInputChange(setLocation)}
        placeholder="Enter your location here"
        className="border p-2 rounded w-full"
      />

      <button
        type="submit"
        disabled={submitting}
        className={`px-4 py-2 rounded text-white font-semibold transition duration-300 flex items-center justify-center space-x-2 ${
          submitted
            ? "bg-green-600 cursor-not-allowed"
            : submitting
            ? "bg-gray-500 cursor-wait"
            : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
        }`}
      >
        {submitting && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        <span>{submitting ? "Submitting..." : submitted ? "Submitted!" : "Submit"}</span>
      </button>

      {submitted && (
        <p className="text-green-700 font-semibold mt-4 text-center">
          Contact info updated successfully!
        </p>
      )}
    </form>
  );
}