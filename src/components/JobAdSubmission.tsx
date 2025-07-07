"use client";

import React, { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";

interface JobAd {
  id: string;
  content: string;
  company: string;
  title: string;
  location: string;
  pay: string;
  overview: string;
  expectations: string;
  submittedAt: string;
}

function parseCompany(ad: string): string {
  const companyMatch = ad.match(/Company:\s*([\w\s&.,'-]+)/i) || ad.match(/at ([\w\s&.,'-]+)/i);
  return companyMatch ? companyMatch[1].trim() : "Unknown";
}

function parseTitle(ad: string): string {
  const titleMatch = ad.match(/Title:\s*([\w\s&.,'-]+)/i);
  if (titleMatch) return titleMatch[1].trim();
  const firstLine = ad.split("\n")[0];
  return firstLine.length < 80 ? firstLine.trim() : "Unknown";
}

function parseLocation(ad: string): string {
  const locMatch = ad.match(/Location:\s*([\w\s&.,'-]+)/i) || ad.match(/in ([\w\s&.,'-]+)/i);
  return locMatch ? locMatch[1].trim() : "Unknown";
}

const JobAdSubmission: React.FC = () => {
  const [adText, setAdText] = useState("");
  const [ads, setAds] = useState<JobAd[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [previewAd, setPreviewAd] = useState<JobAd | null>(null);
  const [user, setUser] = useState<any>(null);
  const [resumeList, setResumeList] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteAd, setDeleteAd] = useState<JobAd | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Get Firebase user
  useEffect(() => {
    import("firebase/auth").then(({ getAuth, onAuthStateChanged }) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (u) => {
        if (u) setUser(u);
      });
    });
  }, []);

  // Fetch resumes once user is available
  useEffect(() => {
    if (user?.uid) {
      fetch(`/api/saveResume?userId=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.resumes) {
            setResumeList(data.resumes);
          }
        });
    }
  }, [user]);

  // Fetch job ads when user is available
  useEffect(() => {
    if (user?.uid) {
      fetch(`/api/jobAd?userId=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.jobAds) {
            setAds(data.jobAds.map((ad: any) => ({
              id: ad.id,
              content: ad.jobText,
              company: ad.company,
              title: ad.title,
              location: ad.location,
              pay: ad.pay,
              overview: ad.overview,
              expectations: ad.expectations,
              submittedAt: new Date(ad.createdAt).toISOString(),
            })));
          }
        });
    } else {
      setAds([]);
    }
  }, [user]);

  const handleGenerateAIResume = async () => {
    if (!selectedResumeId) return alert("Please select a resume first.");

    setIsGenerating(true); 

    try {
      const res = await fetch(`/api/saveResume?userId=${user.uid}&resumeId=${selectedResumeId}`);
      const data = await res.json();
      if (!data.resume) {
        setIsGenerating(false);
        return alert("Resume not found.");
      }

      const jobText = localStorage.getItem("jobText") || "";
      const editableResume = data.resume;

      console.log("🔍 Generating AI Resume with:");
      console.log("→ jobText:", jobText);
      console.log("→ editableResume:", editableResume);

      if (!editableResume || !jobText) {
        console.warn("⚠️ Missing required fields", { editableResume, jobText });
      }

      if (!jobText.trim()) {
        setIsGenerating(false);
        return alert("Job description is missing. Please submit a job ad.");
      }

      const aiRes = await fetch("/api/generateResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText, editableResume }),
      });

      const result = await aiRes.json();
      console.log("AI Resume:", result);

      if (result?.resume) {
        localStorage.setItem("aiResume", JSON.stringify(result.resume));
        setIsGenerating(false);
        setSuccessMessage(" AI resume generated successfully!");

        setTimeout(() => {
          window.location.href = "/"; // redirect after short delay
        }, 1500);
      }
      else {
        setIsGenerating(false);
        alert("AI generation failed.");
      }
    } catch (err) {
      setIsGenerating(false);
      alert("Error generating resume.");
    }
  };

  // Load existing job ads from localStorage
  useEffect(() => {
    // Remove this effect to prevent localStorage from overwriting ads after backend fetch
    // const stored = localStorage.getItem("jobAds");
    // if (stored) setAds(JSON.parse(stored));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adText.trim()) {
      setMessage("Please paste or type a job ad.");
      return;
    }
    setIsAdding(true);
    // Call backend to parse all fields
    try {
      const res = await fetch("/api/jobAd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, jobText: adText })
      });
      const data = await res.json();
      if (data && data.id) {
        // Fetch the new job ad from backend
        const getRes = await fetch(`/api/jobAd?userId=${user?.uid}`);
        const getData = await getRes.json();
        if (getData.jobAds) {
          setAds(getData.jobAds.map((ad: any) => ({
            id: ad.id,
            content: ad.jobText,
            company: ad.company,
            title: ad.title,
            location: ad.location,
            pay: ad.pay,
            overview: ad.overview,
            expectations: ad.expectations,
            submittedAt: new Date(ad.createdAt).toISOString(),
          })));
        }
        setMessage("Job ad submitted and parsed successfully!");
        setTimeout(() => setMessage(null), 2000);
      } else {
        setMessage("Failed to parse job ad.");
      }
    } catch (err) {
      setMessage("Error submitting job ad.");
    }
    setAdText("");
    setIsAdding(false);
  };

  const handleClearJobAds = () => {
    localStorage.removeItem("jobAds");
    setAds([]);
  };

  return (
    <>
      {/* Theme Toggle in top-right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {/* Main Container with background gradient and card effect */}
      <div className="min-h-screen flex flex-col items-center justify-start py-10 px-2 bg-gradient-to-br from-indigo-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-500">
        <div className="w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-6 border border-indigo-100 dark:border-gray-800 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="mb-8">
            <label className="block mb-2 font-bold text-indigo-700 dark:text-indigo-300 text-lg">Paste or type a job ad:</label>
            <textarea
              className="w-full h-32 p-3 border-2 border-indigo-200 dark:border-gray-700 rounded-lg mb-3 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={adText}
              onChange={e => setAdText(e.target.value)}
              placeholder="Paste job ad here..."
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white rounded-lg font-bold shadow hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-lg flex items-center justify-center gap-2"
              disabled={isAdding}
            >
              {isAdding ? (
                <span className="animate-spin mr-2">🔄</span>
              ) : (
                <span role="img" aria-label="submit">📤</span>
              )}
              {isAdding ? "Submitting..." : "Submit Job Ad"}
            </button>
            {message && (
              <div className="mt-3 text-base font-medium text-green-600 dark:text-green-400 text-center">{message}</div>
            )}
          </form>

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <span role="img" aria-label="list">📝</span> Submitted Job Ads
            </h3>
            {/* Removed Clear All button as requested */}
          </div>

          {ads.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white/60 dark:bg-gray-900/60">
              No job ads submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map(ad => (
                <div key={ad.id} className="group p-5 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between border border-indigo-100 dark:border-gray-700 transition-all hover:scale-[1.02] hover:shadow-2xl">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-indigo-700 dark:text-indigo-300 text-lg mb-1 flex items-center gap-2">
                      <span role="img" aria-label="briefcase">💼</span> {ad.title}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Company: <span className="font-medium">{ad.company}</span></div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Location: <span className="font-medium">{ad.location}</span></div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Pay: <span className="font-medium">{ad.pay}</span></div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Overview: <span className="font-medium">{typeof ad.overview === 'string' ? ad.overview.slice(0, 80) + (ad.overview.length > 80 ? '...' : '') : ''}</span></div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Expectations: <span className="font-medium">{typeof ad.expectations === 'string' ? ad.expectations.slice(0, 80) + (ad.expectations.length > 80 ? '...' : '') : ''}</span></div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Submitted: {new Date(ad.submittedAt).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col gap-2 mt-3 md:mt-0 md:ml-4">
                    <button
                      className="px-5 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition group-hover:scale-105"
                      onClick={() => setPreviewAd(ad)}
                    >
                      <span role="img" aria-label="preview">👁️</span> Preview
                    </button>
                    <button
                      className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition group-hover:scale-105"
                      onClick={() => setDeleteAd(ad)}
                    >
                      <span role="img" aria-label="delete">🗑️</span> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Preview Modal */}
          {previewAd && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[80vh] relative mt-16 mb-4">
                <button
                  onClick={() => setPreviewAd(null)}
                  className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-500 text-2xl font-bold"
                  aria-label="Close preview"
                >
                  ×
                </button>
                <h4 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <span role="img" aria-label="briefcase">💼</span> {previewAd.title}
                </h4>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">Company: {previewAd.company}</div>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">Location: {previewAd.location}</div>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">Pay: {previewAd.pay}</div>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">Overview: {previewAd.overview}</div>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">Expectations: {previewAd.expectations}</div>
                <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">Submitted: {new Date(previewAd.submittedAt).toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteAd && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-red-200 dark:border-red-700">
                <button
                  onClick={() => setDeleteAd(null)}
                  className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-500 text-2xl font-bold"
                  aria-label="Close delete modal"
                >
                  ×
                </button>
                <h4 className="text-xl font-bold mb-4 text-red-700 dark:text-red-300 flex items-center gap-2">
                  <span role="img" aria-label="delete">🗑️</span> Delete Job Ad
                </h4>
                <div className="mb-4 text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete the job ad for <span className="font-semibold">{deleteAd.title}</span> at <span className="font-semibold">{deleteAd.company}</span>?
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    onClick={() => setDeleteAd(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        const res = await fetch(`/api/jobAd?id=${deleteAd.id}&userId=${user?.uid}`, {
                          method: "DELETE",
                        });
                        if (res.ok) {
                          setAds(ads.filter(a => a.id !== deleteAd.id));
                          setDeleteAd(null);
                        } else {
                          alert("Failed to delete job ad.");
                        }
                      } catch (err) {
                        alert("Error deleting job ad.");
                      }
                      setIsDeleting(false);
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resume selection and AI generation */}
        {!previewAd && (
          <div className="mt-8 w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-6 border border-indigo-100 dark:border-gray-800 backdrop-blur-md z-[20] relative">
            <label className="block mb-2 font-bold text-indigo-700 dark:text-indigo-300 text-lg">Choose a Resume:</label>
            <select
              className="w-full p-3 rounded-lg border-2 border-indigo-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition mb-4"
              value={selectedResumeId || ""}
              onChange={e => setSelectedResumeId(e.target.value)}
            >
              <option value="">Select a resume...</option>
              {resumeList.map((resume) => (
                <option key={resume.resumeId} value={resume.resumeId}>
                  {resume.customName || resume.objective?.slice(0, 30) || resume.resumeId}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateAIResume}
              disabled={isGenerating}
              className={`w-full text-white font-bold py-3 px-4 rounded-lg text-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${isGenerating ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {isGenerating ? (
                <span><span className="animate-spin inline-block mr-2">🔄</span> Processing...</span>
              ) : (
                <span><span role="img" aria-label="robot">🤖</span> Generate Resume with AI</span>
              )}
            </button>
            {successMessage && (
              <div className="mt-3 text-green-600 font-medium text-base text-center">
                {successMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default JobAdSubmission;

