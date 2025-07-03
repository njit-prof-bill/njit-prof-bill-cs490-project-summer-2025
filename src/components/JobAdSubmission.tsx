"use client";

import React, { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";

interface JobAd {
  id: string;
  content: string;
  company: string;
  title: string;
  location: string;
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
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [user, setUser] = useState<any>(null);
  const [resumeList, setResumeList] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    const stored = localStorage.getItem("jobAds");
    if (stored) setAds(JSON.parse(stored));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!adText.trim()) {
    setMessage("Please paste or type a job ad.");
    return;
  }

  const parsedCompany = parseCompany(adText);
  const parsedTitle = parseTitle(adText);
  const parsedLocation = parseLocation(adText);

  const newAd: JobAd = {
    id: Date.now() + Math.random().toString(36).slice(2),
    content: adText,
    company: company.trim() || parsedCompany,
    title: title.trim() || parsedTitle,
    location: location.trim() || parsedLocation,
    submittedAt: new Date().toISOString(),
  };

  const updated = [newAd, ...ads];
  setAds(updated);
  localStorage.setItem("jobAds", JSON.stringify(updated));
  localStorage.setItem("jobText", adText);
  if (selectedResumeId) {
    localStorage.setItem("resumeId", selectedResumeId);
  }

  setAdText("");
  setTitle("");
  setCompany("");
  setLocation("");
  setMessage("Job ad submitted successfully!");
  setTimeout(() => setMessage(null), 2000);

  window.dispatchEvent(new CustomEvent("set-job-text", { detail: adText }));
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
            <div className="flex flex-col md:flex-row gap-2 mb-3">
              <input
                className="flex-1 p-3 border-2 border-indigo-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Job Title (optional)"
              />
              <input
                className="flex-1 p-3 border-2 border-indigo-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Company (optional)"
              />
              <input
                className="flex-1 p-3 border-2 border-indigo-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location (optional)"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white rounded-lg font-bold shadow hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-lg"
            >
              <span role="img" aria-label="submit">📤</span> Submit Job Ad
            </button>
            {message && (
              <div className="mt-3 text-base font-medium text-green-600 dark:text-green-400 text-center">{message}</div>
            )}
          </form>

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <span role="img" aria-label="list">📝</span> Submitted Job Ads
            </h3>
            {ads.length > 0 && (
              <button
                onClick={handleClearJobAds}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              >
                Clear All
              </button>
            )}
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
                    <div className="text-xs text-gray-500 dark:text-gray-400">Submitted: {new Date(ad.submittedAt).toLocaleString()}</div>
                  </div>
                  <button
                    className="mt-3 md:mt-0 md:ml-4 px-5 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition group-hover:scale-105"
                    onClick={() => setPreviewAd(ad)}
                  >
                    <span role="img" aria-label="preview">👁️</span> Preview
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Preview Modal */}
          {previewAd && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-xl w-full relative border border-indigo-200 dark:border-gray-700">
                <button
                  onClick={() => setPreviewAd(null)}
                  className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-500 text-2xl font-bold"
                  aria-label="Close preview"
                >
                  ×
                </button>
                <h4 className="text-xl font-bold mb-2 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <span role="img" aria-label="briefcase">💼</span> {previewAd.title}
                </h4>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">Company: {previewAd.company}</div>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">Location: {previewAd.location}</div>
                <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">Submitted: {new Date(previewAd.submittedAt).toLocaleString()}</div>
                <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-900 dark:text-gray-100 max-h-96 overflow-auto border border-indigo-100 dark:border-gray-700 mt-2">{previewAd.content}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Resume selection and AI generation */}
        <div className="mt-8 w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-6 border border-indigo-100 dark:border-gray-800 backdrop-blur-md">
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
      </div>
    </>
  );
};

export default JobAdSubmission;

