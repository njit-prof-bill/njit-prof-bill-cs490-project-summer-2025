"use client";

import { useAuth } from "@/context/authContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { getResumeAIResponseJSON, generateResumeAIPromptJSON, getResumeAIResponseText, generateResumeAIPromptText } from "@/components/ai/aiPrompt";

type JobAd = {
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  dateSubmitted: Timestamp;
};

type DownloadResumeButtonProps = {
  text: string;
  fileName: string;
};

function DownloadResumeButton({text, fileName}: DownloadResumeButtonProps) {
  // text: the text of the resume file
  // fileName: self-explalnatory
  function handleDownload() {
    const blob = new Blob([text], { type: "text/plain" });
    // The URL is temporary because it is only used to 
    // download the generated resume (which can vary if 
    // the user clicks "Generate Resume" multiple times 
    // for the same job ad).
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a"); // Anchor element
    downloadLink.href = url;

    // The filename can be optional for now, but I think it would be 
    // a good idea to set this to a value related to the job ad 
    // when calling this function (i.e. the job title)
    // so the user doesn't have to manually rename 
    // different generated resumes for different job ads.
    downloadLink.download = fileName || "resume.txt";

    document.body.appendChild(downloadLink);
    // Simulating the click triggers the download programmatically
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Free up memory
    URL.revokeObjectURL(url);
  }
  
  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      onClick={handleDownload}
    >Download</button>
  );
}

export default function ViewJobAdsPage() {
  const { user, loading } = useAuth();
  const [jobAds, setJobAds] = useState<JobAd[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<JobAd>>({});
  const [refresh, setRefresh] = useState(false);
  const [generatingText, setGeneratingText] = useState(false); // Track whether plain text resume is being generated
  const [generatingJSON, setGeneratingJSON] = useState(false); // Track whether JSON resume is being generated
  const [generated, setGenerated] = useState(false); // Track whether resume was successfully generated
  // const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null); // Track status message related to resume generation
  const [newResume, setNewResume] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      (async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && Array.isArray(userSnap.data().jobAds)) {
          setJobAds(userSnap.data().jobAds);
        }
      })();
    }
  }, [user, loading, refresh]);

  const handleGenerateText = async (idx: number) => {
    if (!user) return;
    try {
      setGeneratingJSON(false);
      setGeneratingText(true);
      setNewResume(null); // Clear any previous result
      setStatus(null); // Clear any previous status message
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().resumeFields) {
        const resumeInfo = JSON.stringify(userSnap.data().resumeFields);
        const jobAdText = jobAds[idx].jobDescription;
        // const result = await getResumeAIResponseText(generateResumeAIPromptJSON, resumeInfo, jobAdText);
        const JSONResume = await getResumeAIResponseJSON(generateResumeAIPromptJSON, resumeInfo, jobAdText);
        const result = await getResumeAIResponseText(generateResumeAIPromptText, JSONResume);
        setNewResume(result);
        setStatus("Resume generated!");
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error) {
      setStatus(`Error occurred while generating resume: ${error}`);
      setNewResume(null);
    } finally {
      setGeneratingText(false);
    }
  };

  const handleGenerateJSON = async (idx: number) => {
    if (!user) return;
    try {
      setGeneratingText(false);
      setGeneratingJSON(true);
      // setError(null); // Clear any previous error message
      setNewResume(null); // Clear any previous result
      setStatus(null); // Clear any previous status message
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().resumeFields) {
        const resumeInfo = JSON.stringify(userSnap.data().resumeFields);
        const jobAdText = jobAds[idx].jobDescription;
        const result = await getResumeAIResponseJSON(generateResumeAIPromptJSON, resumeInfo, jobAdText);
        setNewResume(result);
        setStatus("Resume generated!");
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error) {
      setStatus(`Error occurred while generating resume: ${error}`);
      setNewResume(null);
      // console.error("Error occurred while generating resume: ", error);
      // setError((error as Error).message);
    } finally {
      setGeneratingJSON(false);
    }
  };

  const handleDelete = async (idx: number) => {
    if (!user) return;
    const newAds = jobAds.filter((_, i) => i !== idx);
    await updateDoc(doc(db, "users", user.uid), { jobAds: newAds });
    setSelectedIndex(null);
    setRefresh((r) => !r);
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditData({ ...jobAds[idx] });
  };

  const handleEditChange = (field: keyof JobAd, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (editIndex === null || !user) return;
    const updatedAds = [...jobAds];
    updatedAds[editIndex] = {
      ...updatedAds[editIndex],
      ...editData,
      dateSubmitted: Timestamp.now(),
    };
    await updateDoc(doc(db, "users", user.uid), { jobAds: updatedAds });
    setEditIndex(null);
    setRefresh((r) => !r);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white dark:bg-stone-900 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Your Job Ads</h1>
      <div className="flex">
        {/* Drawer */}
        <div className="w-1/3 border-r pr-4">
          {jobAds.length === 0 && <div>No job ads found.</div>}
          {jobAds.map((ad, idx) => (
            <div
              key={idx}
              className={`p-2 mb-2 rounded cursor-pointer ${selectedIndex === idx ? "bg-blue-100 dark:bg-stone-800" : "hover:bg-gray-100 dark:hover:bg-stone-800"}`}
              onClick={() => {
                // Don't remove the generated resume unless the user clicks on a different job ad
                if (selectedIndex !== idx) setNewResume(null);
                setSelectedIndex(idx);
              }}
            >
              <div className="font-semibold">{ad.jobTitle}</div>
              <div className="text-xs text-gray-500">
                {ad.companyName}
              </div>
              <div className="text-xs text-gray-400">
                {ad.dateSubmitted?.toDate?.().toLocaleString?.() || ""}
              </div>
            </div>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 pl-6">
          {selectedIndex === null ? (
            <div className="text-gray-500">Select a job ad to view details.</div>
          ) : editIndex === selectedIndex ? (
            <div>
              <div className="mb-2">
                <label className="block font-medium">Job Title</label>
                <input
                  className="w-full border rounded p-2 text-black"
                  value={editData.jobTitle || ""}
                  onChange={(e) => handleEditChange("jobTitle", e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="block font-medium">Company Name</label>
                <input
                  className="w-full border rounded p-2 text-black"
                  value={editData.companyName || ""}
                  onChange={(e) => handleEditChange("companyName", e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="block font-medium">Job Description</label>
                <textarea
                  className="w-full border rounded p-2 text-black"
                  rows={8}
                  value={editData.jobDescription || ""}
                  onChange={(e) => handleEditChange("jobDescription", e.target.value)}
                />
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => setEditIndex(null)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-2">
                <span className="font-bold">Job Title:</span> {jobAds[selectedIndex].jobTitle}
              </div>
              <div className="mb-2">
                <span className="font-bold">Company Name:</span> {jobAds[selectedIndex].companyName}
              </div>
              <div className="mb-2">
                <span className="font-bold">Date Uploaded:</span>{" "}
                {jobAds[selectedIndex].dateSubmitted?.toDate?.().toLocaleString?.() || ""}
              </div>
              <div className="mb-4 whitespace-pre-line">
                <span className="font-bold">Description:</span>
                <div className="mt-1">{jobAds[selectedIndex].jobDescription}</div>
              </div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                disabled={generatingText || generatingJSON}
                onClick={() => handleGenerateText(selectedIndex)}
              >
                {generatingText ? "Generating..." : "Generate Text Resume"}
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                disabled={generatingJSON || generatingText}
                onClick={() => handleGenerateJSON(selectedIndex)}
              >
                {generatingJSON ? "Generating..." : "Generate JSON Resume"}
              </button>
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => handleEdit(selectedIndex)}
              >
                Edit
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded mr-2"
                onClick={() => handleDelete(selectedIndex)}
              >
                Delete
              </button>
              <div>
                {status && <p className="mt-2 text-sm text-green-700">{status}</p>}
              </div>
              <div>
                {newResume && (
                  <div>
                    <div>
                      <p>Your new generated resume:</p>
                      <p className="font-mono">{newResume}</p>
                    </div>
                    <DownloadResumeButton text={newResume} fileName={`${jobAds[selectedIndex].jobTitle}.txt`} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}