"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import React from "react";

import FileUpload, { DocxPreview, OdtPreview, MarkdownPreview } from "@/components/FileUpload";
import BioSubmission from "@/components/forms/BioSubmission";

import SkillsList from "@/components/SkillsList";
import ContactCard from "@/components/ContactCard";
import EducationList from "@/components/EducationList";
import JobHistory from "@/components/JobHistory";
import RawToggle from "@/components/ui/RawToggle";
import ThemeToggle from "@/components/ThemeToggle";
import DocumentList from "@/components/DocumentList";


export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [submittedBio, setSubmittedBio] = useState("");

  const [uploaded, setUploaded] = useState(false);
  const [parsedResume, setParsedResume] = useState<{
    emails?: string[];
    phones?: string[];
    objective?: string;
    skills?: string[];
    jobHistory?: any[];
    education?: any[];
    bio?: string;
    fileName?: string;
  } | null>(null);

  const [editableResume, setEditableResume] = useState<typeof parsedResume>(null);

  const [bio, setBio] = useState("");
  const [jobText, setJobText] = useState("");
  const [generating, setGenerating] = useState(false);

  const [resumeList, setResumeList] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);

  const [showNameModal, setShowNameModal] = useState(false);
  const [customResumeName, setCustomResumeName] = useState("");

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const breakdownRef = useRef<HTMLButtonElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) {
      // Fetch all resumes for this user
      fetch(`/api/saveResume?userId=${user?.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.resumes) {
            setResumeList(data.resumes);
          }
        });
    }
  }, [user, loading]);
useEffect(() => {
  const storedJobText = localStorage.getItem("jobText");
  const storedResumeId = localStorage.getItem("resumeId");
  const aiResume = localStorage.getItem("aiResume");

  if (storedJobText) {
    setJobText(storedJobText);
  }

  if (storedResumeId && !aiResume) {
    handleLoadResume(storedResumeId);
  }
}, []);


useEffect(() => {
  const storedAI = localStorage.getItem("aiResume");
  if (storedAI) {
    const parsed = JSON.parse(storedAI);
    setParsedResume(parsed);
    setEditableResume(parsed);
    setBio(parsed.bio || "");
    setUploaded(true);
  }
}, []);

  const handleLoadResume = async (resumeId: string) => {
    const res = await fetch(`/api/saveResume?userId=${user?.uid}&resumeId=${resumeId}`);
    const data = await res.json();
    if (data.resume) {
      setParsedResume(data.resume);
      setEditableResume(data.resume);
      setBio(data.resume.bio || "");
      setUploaded(true);
      setSelectedResumeId(resumeId);
    }
  };

const handleViewBreakdown = () => {
  if (!parsedResume) {
    alert("No resume loaded.");
    return;
  }

  setEditableResume(parsedResume);
  setUploaded(true);
  setBio(parsedResume.bio || "");
};

  const handleReset = () => {
    setUploaded(false);
    setParsedResume(null);
    setEditableResume(null);
    setBio("");
    setSelectedResumeId(null);
    // Scroll to top of the page after reset
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Add handler to force home navigation
  const handleForceHome = () => {
    setUploaded(false);
    setParsedResume(null);
    setEditableResume(null);
    setBio("");
    setSelectedResumeId(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = () => {};

  const handleConfirmSave = async () => {
    setSaveStatus('saving');
    try {
      // Only save if there is a selected resume (i.e., editing an existing one)
      if (!selectedResumeId || !editableResume) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 1500);
        return;
      }
      const dataToSave = { ...editableResume, bio, userId: user?.uid, resumeId: selectedResumeId, customName: customResumeName };
      const res = await fetch("/api/saveResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });
      if (!res.ok) throw new Error("Save failed");
      const result = await res.json();
      setSaveStatus('success');
      setCustomResumeName("");
      // Refresh resume list after save
      if (user && user.uid) {
        fetch(`/api/saveResume?userId=${user.uid}`)
          .then(res => res.json())
          .then(data => {
            if (data.resumes) {
              setResumeList(data.resumes);
            }
          });
      }
      setTimeout(() => {
        setShowNameModal(false);
        setSaveStatus('idle');
      }, 1200);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }
  };

  // Only scroll after upload/parse is complete (i.e., when aiLoading goes from true to false and parsedResume is set)
  const prevAiLoading = useRef(false);
  useEffect(() => {
    if (prevAiLoading.current && !aiLoading && parsedResume && breakdownRef.current) {
      setTimeout(() => {
        breakdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
    prevAiLoading.current = aiLoading;
  }, [aiLoading, parsedResume]);

  // Listen for force-home event to reset state from navigation
  useEffect(() => {
    const handler = () => handleReset();
    window.addEventListener("force-home", handler);
    return () => window.removeEventListener("force-home", handler);
  }, []);
  
  useEffect(() => {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail) {
      setJobText(customEvent.detail);
    }
  };
  window.addEventListener("set-job-text", handler);
  return () => window.removeEventListener("set-job-text", handler);
}, []);


  if (loading) return <p>Loading... This may take awhile!</p>;

  const handleGenerateResumeFromAI = async () => {
    if (!editableResume || !jobText) {
      alert("Missing required information to generate resume.");
      return;
    }

    setGenerating(true);
    try {
      // Remove bio from editableResume before sending
      const { bio, ...resumeWithoutBio } = editableResume || {};
      const res = await fetch("/api/generateResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editableResume: resumeWithoutBio, jobText }),
      });

      const data = await res.json();
      if (data.resume) {
        setEditableResume(prev => ({
          ...prev,
          ...data.resume
        }));
        alert("Resume generated successfully!");
      } else {
        console.error("AI generation failed:", data);
        alert("Failed to generate resume.");
      }
    } catch (err) {
      console.error("Resume generation error:", err);
      alert("Error generating resume.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-2 md:px-6 py-8 md:py-12 font-sans overflow-x-hidden">
      {/* Animated SVG background */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-60" style={{filter:'blur(2px)'}} aria-hidden="true">
        <defs>
          <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <circle cx="20%" cy="20%" r="180" fill="url(#bg-grad)" opacity="0.18">
          <animate attributeName="cx" values="20%;80%;20%" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle cx="80%" cy="80%" r="140" fill="#818cf8" opacity="0.12">
          <animate attributeName="cy" values="80%;30%;80%" dur="14s" repeatCount="indefinite" />
        </circle>
        <rect x="60%" y="10%" width="200" height="200" rx="80" fill="#f472b6" opacity="0.08">
          <animate attributeName="x" values="60%;10%;60%" dur="16s" repeatCount="indefinite" />
        </rect>
      </svg>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md rounded-b-2xl mb-8 flex items-center justify-between px-4 md:px-8 py-3 md:py-5 border-b border-indigo-200 dark:border-gray-800">
        <div className="flex items-center gap-2 min-h-[40px]">{/* whitespace for alignment */}</div>
        <ThemeToggle />
      </header>
      {/* Stepper/Progress Bar */}
      <div className="relative z-10 flex items-center justify-center mb-10">
        <div className="flex items-center gap-0 md:gap-4 w-full max-w-2xl">
          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900 text-xl font-bold">1</div>
            <span className="mt-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">Upload</span>
          </div>
          <div className="flex-1 h-1 bg-gradient-to-r from-indigo-300 via-blue-300 to-teal-200 dark:from-indigo-700 dark:via-blue-800 dark:to-teal-700 rounded-full mx-1 md:mx-2" />
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900 text-xl font-bold ${uploaded ? 'bg-gradient-to-br from-pink-400 to-fuchsia-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>2</div>
            <span className="mt-2 text-xs font-semibold text-pink-700 dark:text-pink-300">Edit</span>
          </div>
          <div className="flex-1 h-1 bg-gradient-to-r from-pink-200 via-fuchsia-200 to-green-200 dark:from-pink-800 dark:via-fuchsia-800 dark:to-green-700 rounded-full mx-1 md:mx-2" />
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900 text-xl font-bold ${uploaded ? 'bg-gradient-to-br from-green-400 to-teal-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>3</div>
            <span className="mt-2 text-xs font-semibold text-green-700 dark:text-green-300">Save</span>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl space-y-12 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium text-center max-w-2xl mb-2 md:mb-4">
        Build, edit, and manage your professional resumes with creativity and ease.
          </p>
        </div>
        {/* Decorative divider */}
        <div className="w-full flex justify-center mb-8">
          <svg width="180" height="16" viewBox="0 0 180 16" fill="none" className="opacity-70"><path d="M0 8 Q45 0 90 8 T180 8" stroke="#818cf8" strokeWidth="2" fill="none"/></svg>
        </div>
        {!uploaded ? (
          <>
        <div className="flex flex-col gap-8 items-stretch w-full max-w-7xl mx-auto">
          <div className="bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl p-8 flex flex-col items-center border-2 border-indigo-200 dark:border-indigo-700 w-full max-w-md mx-auto transition-all hover:scale-[1.025] hover:shadow-2xl duration-200 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 opacity-30 pointer-events-none">
              <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="url(#upload-grad)" /><defs><linearGradient id="upload-grad" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#38bdf8"/></linearGradient></defs></svg>
            </div>
            <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-4 text-center tracking-tight flex items-center gap-2">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 17V7M12 7l-5 5m5-5l5 5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Upload Your Resume
            </h2>
            <FileUpload
              onParsed={async (resume) => {
                console.log("Parsed resume:", resume);
                const res = await fetch("/api/saveResume", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...resume,
                    userId: user?.uid,
                    bio: "",  // bio is not known yet at this stage
                    displayName: resume.fileName || "Uploaded Resume",
                  }),
                });
                const data = await res.json();
                if (res.ok && data.resumeId) {
                  const response = await fetch(`/api/saveResume?userId=${user?.uid}&resumeId=${data.resumeId}`);
                  const loaded = await response.json();
                  if (loaded.resume) {
                    setParsedResume(loaded.resume);
                    setEditableResume(loaded.resume);
                    setSelectedResumeId(data.resumeId);
                  }
                } else {
                  console.error("Failed to save/upload resume.");
                }
              }}
              setAiLoading={setAiLoading}
              onPreview={(url, name) => {
                setPreviewUrl(url);
                setPreviewName(name);
              }}
              onUploadSuccess={() => {
                // Always refresh resume list after upload
                if (user && user.uid) {
                  fetch(`/api/saveResume?userId=${user.uid}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.resumes) {
                        setResumeList(data.resumes);
                      }
                    });
                }
              }}
            />
          </div>
          <div className="bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl p-8 flex flex-col items-center border-2 border-pink-200 dark:border-pink-700 w-full max-w-4xl mx-auto transition-all hover:scale-[1.025] hover:shadow-2xl duration-200 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 opacity-30 pointer-events-none">
              <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="url(#bio-grad)" /><defs><linearGradient id="bio-grad" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f472b6"/><stop offset="1" stopColor="#a78bfa"/></linearGradient></defs></svg>
            </div>
            <h2 className="text-xl font-bold text-pink-700 dark:text-pink-300 mb-4 text-center tracking-tight flex items-center gap-2">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 0v8l4 2" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Your Bio
            </h2>
            <BioSubmission
          bio={bio}
          setBio={setBio}
          onSubmitSuccess={(submitted) => setSubmittedBio(submitted)}
          showSubmitButton={true}
          onUploadSuccess={() => {
            // Refresh resume list after bio submission
            if (user && user.uid) {
              fetch(`/api/saveResume?userId=${user.uid}`)
                .then(res => res.json())
                .then(data => {
                  if (data.resumes) {
                    setResumeList(data.resumes);
                  }
                });
            }
          }}
            />
          </div>
        </div>
        <button
          ref={breakdownRef}
          onClick={handleViewBreakdown}
          disabled={!parsedResume}
          className={`w-full px-6 py-3 rounded-lg text-lg font-bold shadow-lg transition-all duration-200 border-2 border-indigo-500 mt-8 mb-2
            ${parsedResume ? "bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 text-white hover:from-indigo-600 hover:to-teal-500 scale-[1.02]" : "bg-gray-300 text-gray-400 cursor-not-allowed"}
          `}
          style={{ letterSpacing: '0.05em', opacity: 1, visibility: 'visible' }}
        >
          <span role="img" aria-label="edit" className="mr-2">✏️</span>
          Edit Uploaded Resume/Bio
        </button>
        {!parsedResume && (
          <div className="text-center text-gray-500 text-sm mt-2">
            Please upload or load a resume to enable this button.
          </div>
        )}
        {/* Floating Action Button for Upload/Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-indigo-500 via-blue-500 to-teal-400 text-white rounded-full shadow-2xl p-4 hover:scale-110 hover:shadow-3xl transition-all duration-200 border-4 border-white dark:border-gray-900 flex items-center gap-2 group"
          aria-label="Back to Top"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 19V5M12 5l-7 7m7-7l7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="hidden md:inline font-bold text-lg group-hover:opacity-100 opacity-80">Top</span>
        </button>
          </>
        ) : (
          <div className="bg-white/98 dark:bg-gray-900/98 rounded-3xl shadow-2xl p-6 md:p-10 space-y-8 border-2 border-indigo-200 dark:border-indigo-700 transition-all relative overflow-hidden">
            <div className="absolute -top-8 -left-8 opacity-20 pointer-events-none">
              <svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" fill="url(#edit-grad)" /><defs><linearGradient id="edit-grad" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#38bdf8"/><stop offset="1" stopColor="#a78bfa"/></linearGradient></defs></svg>
            </div>
        <ContactCard
          contact={{
            emails: editableResume?.emails || [""],
            phones: editableResume?.phones || [""]
          }}
          onChange={(newContact) =>
            setEditableResume((prev) => ({
          ...prev,
          emails: newContact.emails,
          phones: newContact.phones,
            }))
          }
        />
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md w-full mb-6">
          <h3 className="text-xl font-semibold mb-2 tracking-tight flex items-center gap-2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Career Objective
          </h3>
          <textarea
            className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:outline-none focus:bg-gray-600 resize-y transition-all"
            style={{ minHeight: '100px', height: 'auto', overflow: 'hidden' }}
            value={editableResume?.objective || ""}
            onChange={e => setEditableResume(prev => ({ ...prev, objective: e.target.value }))
            }
            placeholder="Enter your career objective (optional)"
            rows={1}
            onInput={e => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = target.scrollHeight + 'px';
            }}
          />
        </div>
        <SkillsList
          skills={editableResume?.skills || []}
          onChange={(newSkills) =>
            setEditableResume((prev) => ({ ...prev, skills: newSkills }))
          }
        />
        <EducationList
          education={editableResume?.education || []}
          onChange={(newEdu) =>
            setEditableResume((prev) => ({ ...prev, education: newEdu }))
          }
        />
        <JobHistory
          jobs={editableResume?.jobHistory || []}
          onChange={(newJobs) =>
            setEditableResume((prev) => ({ ...prev, jobHistory: newJobs }))
          }
        />
        <RawToggle label="Raw Resume Data" data={editableResume} />
        <div className="flex flex-col md:flex-row gap-4 mt-6 max-w-3xl mx-auto">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded font-semibold shadow-md transition-all"
          >
            Upload Different Resume
          </button>
          <button
            onClick={handleConfirmSave}
            className="px-4 py-2 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded font-semibold shadow-md transition-all"
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
          </div>
        )}
        {/* DocumentList UI for all resumes */}
        {!uploaded && (
          <DocumentList
            documents={resumeList.map(r => ({
              id: r.resumeId,
              name: r.label || r.fileName || r.customName || r.resumeId,
              type: r.fileType || r.type || 'FILE',
              createdAt: r.updatedAt || r.timestamp,
              // Optionally add previewText, onPreview, onDelete, etc.
              onDelete: async () => {
                if (!user?.uid || !r.resumeId) return;
                if (!window.confirm('Are you sure you want to delete this resume?')) return;
                const res = await fetch(`/api/saveResume?userId=${user.uid}&resumeId=${r.resumeId}`, { method: 'DELETE' });
                if (res.ok) {
                  setResumeList(resumeList.filter(x => x.resumeId !== r.resumeId));
                  if (selectedResumeId === r.resumeId) setSelectedResumeId(null);
                } else {
                  alert('Failed to delete resume.');
                }
              },
              onPreview: () => {
                if (r.base64) {
                  setPreviewUrl(r.base64);
                  setPreviewName(r.label || r.fileName || r.customName || r.resumeId);
                }
              },
            }))}
            selectedId={selectedResumeId || undefined}
            onSelect={doc => handleLoadResume(doc.id)}
            aiLoading={aiLoading}
          />
        )}
        {parsedResume && parsedResume.fileName && (
          <div className="text-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium mt-2 px-3 py-1 rounded shadow inline-block">
        Uploaded File: <span className="font-semibold">{parsedResume.fileName}</span>
          </div>
        )}
      </div>
      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6 overflow-auto max-h-[90vh]">
            <button
              onClick={() => { setPreviewUrl(null); setPreviewName(null); }}
              className="absolute top-3 right-4 text-2xl text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-bold z-10"
              aria-label="Close preview"
            >
              ×
            </button>
            <div className="mb-4 font-semibold text-lg text-gray-700 dark:text-gray-200">Preview: {previewName}</div>
            <div className="overflow-auto max-h-[70vh]">
              {(() => {
                const fileName = previewName || '';
                const lowerName = fileName.toLowerCase();
                const isMarkdown = lowerName.endsWith('.md');
                if (!previewUrl) return null;
                if (previewUrl.startsWith('data:application/pdf')) {
                  return <iframe src={previewUrl} title="PDF Preview" className="w-full h-[50vh] bg-white dark:bg-gray-900" />;
                } else if (previewUrl.startsWith('data:image')) {
                  return <img src={previewUrl} alt="Preview" className="max-w-full max-h-[50vh] mx-auto bg-white dark:bg-gray-900" />;
                } else if (previewUrl.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                  return <DocxPreview base64={previewUrl} />;
                } else if (previewUrl.startsWith('data:application/vnd.oasis.opendocument.text')) {
                  return <OdtPreview base64={previewUrl} />;
                } else if (isMarkdown) {
                  return <MarkdownPreview base64={previewUrl} />;
                } else if (previewUrl.startsWith('data:text')) {
                  try {
                    const base64 = previewUrl.split(',')[1];
                    const text = atob(base64);
                    return <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">{text}</div>;
                  } catch {
                    return <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">Unable to preview this file type.</div>;
                  }
                } else {
                  return (
                    <div className="flex flex-col items-center">
                      <span className="text-gray-600 dark:text-gray-300 mb-2">Unable to preview this file type.</span>
                      <a href={previewUrl} download className="text-blue-600 dark:text-blue-400 underline">Download file</a>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
