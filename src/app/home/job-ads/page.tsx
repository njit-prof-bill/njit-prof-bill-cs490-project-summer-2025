"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/context/toastContext";
import { Button } from "@/components/ui/button";

interface JobAd {
  id: string;
  url?: string;
  rawText?: string;
  companyName: string;
  jobTitle: string;
  postedAt: string;
  previewHtml: string;
}

interface ParsedJob {
  jobTitle: string;
  companyName: string;
  postedAt: string;
  location?: string;
  description: string;
  requirements: string[];
}

export default function JobAdsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [jobAds, setJobAds] = useState<JobAd[]>([]);
  const [selectedAd, setSelectedAd] = useState<JobAd | null>(null);
  const [parsed, setParsed] = useState<ParsedJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);

  // NEW: profiles for resume gen
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string>("");

  // Load job ads + profiles on mount
  useEffect(() => {
    if (!user) return;
    user.getIdToken().then((token) => {
      fetch("/api/job-ads", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((ads: JobAd[]) => {
          setJobAds(ads);
          if (ads.length > 0) setSelectedAd(ads[0]);
        })
        .catch(console.error);

      fetch("/api/profiles", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((plist: { id: string; name: string }[]) => {
          setProfiles(plist);
          if (plist.length > 0) setSelectedProfileId(plist[0].id);
        })
        .catch(console.error);
    });
  }, [user]);

  // Re-parse when selectedAd changes
  useEffect(() => {
    if (!selectedAd) {
      setParsed(null);
      return;
    }
    setParsing(true);
    fetch("/api/job-ads/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: selectedAd.url,
        rawText: selectedAd.rawText,
      }),
    })
      .then((r) => r.json())
      .then((pj: ParsedJob) => setParsed(pj))
      .catch((err) => toast.error(err.message))
      .finally(() => setParsing(false));
  }, [selectedAd, toast]);

  // Save a new ad
  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/job-ads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url || undefined, rawText: rawText || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      const newAd: JobAd = {
        id: data.id,
        url: data.url,
        rawText: data.rawText,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        postedAt: data.postedAt,
        previewHtml: data.previewHtml,
      };

      setJobAds((prev) => [newAd, ...prev]);
      setSelectedAd(newAd);
      setUrl("");
      setRawText("");
      toast.success("Job ad saved!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Generate resume
  const handleGenerate = async () => {
    if (!user || !selectedAd || !selectedProfileId) return;
    setGenerating(true);
    setGeneratedResume("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: selectedProfileId,
          jobAdId: selectedAd.id,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Generation failed");
      setGeneratedResume(result.resume);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-8">
      {/* Left: Form + Details + Resume Gen */}
      <div className="lg:col-span-3 space-y-8">
        {/* Form */}
        <section className="p-6 bg-neutral-800 rounded-lg space-y-4">
          <h1 className="text-2xl font-bold">Add Job Ad</h1>
          <div className="space-y-2">
            <label className="block">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 bg-neutral-700 rounded"
              placeholder="https://example.com/job-posting"
            />
          </div>
          <div className="space-y-2">
            <label className="block">Or Paste Text</label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-2 bg-neutral-700 rounded"
              rows={4}
            />
          </div>
          <Button onClick={handleSave} disabled={loading || (!url && !rawText)}>
            {loading ? "Saving…" : "Save Job Ad"}
          </Button>
        </section>

        {/* AI-Extracted */}
        {selectedAd && (
          <section className="p-6 bg-neutral-800 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold">
              {parsing ? "Extracting…" : parsed?.jobTitle || "Loading…"}
            </h2>
            {parsed && (
              <>
                <p className="text-sm text-neutral-400">
                  <strong>Company:</strong> {parsed.companyName}
                </p>
                <p className="text-sm text-neutral-400">
                  <strong>Posted at:</strong> {parsed.postedAt}
                </p>
                {parsed.location && (
                  <p className="text-sm text-neutral-400">
                    <strong>Location:</strong> {parsed.location}
                  </p>
                )}
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm">{parsed.description}</p>
                </div>
                <div>
                  <h3 className="font-medium">Requirements</h3>
                  <ul className="list-disc list-inside text-sm">
                    {parsed.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </section>
        )}

        {/* Full-Text Verbatim */}
        {/* {selectedAd && (
          <section className="p-6 bg-neutral-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Full Text (verbatim)</h2>
            {selectedAd.rawText ? (
              <pre className="whitespace-pre-wrap bg-neutral-700 p-4 rounded max-h-[500px] overflow-auto text-sm">
                {selectedAd.rawText}
              </pre>
            ) : (
              <div
                className="prose prose-invert bg-neutral-700 p-4 rounded max-h-[500px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: selectedAd.previewHtml }}
              />
            )}
          </section>
        )} */}

        {/* Resume Generation */}
        {selectedAd && profiles.length > 0 && (
          <section className="p-6 bg-neutral-800 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold">Generate Resume</h2>
            <div className="flex items-center space-x-4">
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="bg-neutral-700 p-2 rounded"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? "Processing…" : "Generate Resume"}
              </Button>
            </div>
            {generatedResume && (
              <pre className="whitespace-pre-wrap bg-neutral-700 p-4 rounded text-sm">
                {generatedResume}
              </pre>
            )}
          </section>
        )}
      </div>

      {/* Sidebar: List */}
      <aside className="space-y-4">
        <h2 className="text-xl font-semibold">Previous Job Ads</h2>
        <ul className="space-y-2">
          {jobAds.map((ad) => (
            <li key={ad.id}>
              <button
                onClick={() => setSelectedAd(ad)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  selectedAd?.id === ad.id
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                }`}
              >
                <div className="font-medium">{ad.jobTitle}</div>
                <div className="text-xs text-neutral-400">
                  {ad.companyName} •{" "}
                  {new Date(ad.postedAt).toLocaleDateString()}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
