"use client";

import React, { useState, useEffect } from "react";

interface JobAd {
  id: string;
  content: string;
  company: string;
  title: string;
  location: string;
  submittedAt: string;
}

function parseCompany(ad: string): string {
  // Simple heuristic: look for 'Company:' or 'at <Company>'
  const companyMatch = ad.match(/Company:\s*([\w\s&.,'-]+)/i) || ad.match(/at ([\w\s&.,'-]+)/i);
  return companyMatch ? companyMatch[1].trim() : "Unknown";
}

function parseTitle(ad: string): string {
  // Simple heuristic: look for 'Title:' or first line
  const titleMatch = ad.match(/Title:\s*([\w\s&.,'-]+)/i);
  if (titleMatch) return titleMatch[1].trim();
  const firstLine = ad.split("\n")[0];
  return firstLine.length < 80 ? firstLine.trim() : "Unknown";
}

function parseLocation(ad: string): string {
  // Simple heuristic: look for 'Location:' or 'in <Location>'
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
    setAdText("");
    setTitle("");
    setCompany("");
    setLocation("");
    setMessage("Job ad submitted successfully!");
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-6">
        <label className="block mb-2 font-semibold">Paste or type a job ad:</label>
        <textarea
          className="w-full h-32 p-2 border rounded mb-2 dark:bg-gray-800 dark:text-white"
          value={adText}
          onChange={e => setAdText(e.target.value)}
          placeholder="Paste job ad here..."
        />
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            className="flex-1 p-2 border rounded dark:bg-gray-800 dark:text-white"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Job Title (optional)"
          />
          <input
            className="flex-1 p-2 border rounded dark:bg-gray-800 dark:text-white"
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Company (optional)"
          />
          <input
            className="flex-1 p-2 border rounded dark:bg-gray-800 dark:text-white"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Location (optional)"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Submit Job Ad
        </button>
        {message && (
          <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">{message}</div>
        )}
      </form>
      <h3 className="text-lg font-bold mb-2">Submitted Job Ads</h3>
      {ads.length === 0 ? (
        <div className="text-gray-500">No job ads submitted yet.</div>
      ) : (
        <div className="space-y-3">
          {ads.map(ad => (
            <div key={ad.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-indigo-700 dark:text-indigo-300">{ad.title}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Company: <span className="font-medium">{ad.company}</span></div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Location: <span className="font-medium">{ad.location}</span></div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Submitted: {new Date(ad.submittedAt).toLocaleString()}</div>
              </div>
              <button
                className="mt-2 md:mt-0 md:ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setPreviewAd(ad)}
              >
                Preview
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Preview Modal */}
      {previewAd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-xl w-full relative">
            <button
              onClick={() => setPreviewAd(null)}
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-500 text-2xl font-bold"
              aria-label="Close preview"
            >
              ×
            </button>
            <h4 className="text-lg font-bold mb-2">{previewAd.title}</h4>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">Company: {previewAd.company}</div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">Location: {previewAd.location}</div>
            <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">Submitted: {new Date(previewAd.submittedAt).toLocaleString()}</div>
            <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm text-gray-900 dark:text-gray-100 max-h-96 overflow-auto">{previewAd.content}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobAdSubmission;
