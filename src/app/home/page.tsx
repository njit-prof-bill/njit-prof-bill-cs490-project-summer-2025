"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import FileUpload from "@/components/FileUpload";
import BioSubmission from "@/components/forms/BioSubmission";

import SkillsList from "@/components/ui/SkillsList";
import ContactCard from "@/components/ContactCard";
import EducationList from "@/components/EducationList";
import JobHistory from "@/components/ui/JobHistory";
import RawToggle from "@/components/ui/RawToggle";

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

  const [resumeList, setResumeList] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

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
    setEditableResume(parsedResume);
    setUploaded(true);
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

  const handleSave = async () => {
    try {
      const dataToSave = { ...editableResume, bio, userId: user?.uid, resumeId: selectedResumeId };
      const res = await fetch("/api/saveResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });
      if (!res.ok) throw new Error("Save failed");
      const result = await res.json();
      if (!selectedResumeId && result.resumeId) {
        setSelectedResumeId(result.resumeId);
      }
      alert("Resume saved successfully!");
      // Refresh resume list
      if (user && user.uid) {
        fetch(`/api/saveResume?userId=${user.uid}`)
          .then(res => res.json())
          .then(data => {
            if (data.resumes) {
              setResumeList(data.resumes);
            }
          });
      }
    } catch (error) {
      alert("Error saving resume");
    }
  };

  // Listen for force-home event to reset state from navigation
  useEffect(() => {
    const handler = () => handleReset();
    window.addEventListener("force-home", handler);
    return () => window.removeEventListener("force-home", handler);
  }, []);

  if (loading) return <p>Loading... This may take awhile!</p>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-500 to-teal-400 mb-2 drop-shadow-lg">
            Polaris Resume Builder
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium text-center max-w-2xl">
            Build, edit, and manage your professional resumes with creativity and ease.
          </p>
        </div>
        {!uploaded ? (
          <>
            <div className="flex flex-col gap-8 items-center w-full">
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-6 flex flex-col items-center border border-indigo-200 dark:border-gray-700 w-full max-w-md">
                <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-4 text-center">
                  Upload Your Resume
                </h2>
                <FileUpload onParsed={setParsedResume} />
              </div>
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-8 flex flex-col items-center border border-indigo-200 dark:border-gray-700 w-full max-w-5xl">
                <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-4 text-center">
                  Your Bio
                </h2>
                <BioSubmission
                  bio={bio}
                  setBio={setBio}
                  onSubmitSuccess={(submitted) => setSubmittedBio(submitted)}
                  showSubmitButton={true}
                />
              </div>
            </div>
            <button
              onClick={handleViewBreakdown}
              disabled={!parsedResume}
              className={`w-full px-6 py-3 rounded-lg text-lg font-bold shadow-lg transition-colors duration-200 border-2 border-indigo-500 mt-8 mb-2
                ${parsedResume ? "bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 text-white hover:from-indigo-600 hover:to-teal-500" : "bg-gray-300 text-gray-400 cursor-not-allowed"}
              `}
              style={{ letterSpacing: '0.05em', opacity: 1, visibility: 'visible' }}
            >
              <span role="img" aria-label="eye" className="mr-2">👁️</span>
              View Resume Breakdown
            </button>
            {!parsedResume && (
              <div className="text-center text-gray-500 text-sm mt-2">
                Please upload or load a resume to enable this button.
              </div>
            )}
          </>
        ) : (
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-10 space-y-8 border border-indigo-200 dark:border-gray-700">
          <ContactCard
            contact={{
              emails: editableResume?.emails || [""],
              phones: editableResume?.phones || [""],
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
            <h3 className="text-xl font-semibold mb-2">Career Objective</h3>
            <textarea
              className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:outline-none focus:bg-gray-600 resize-y"
              style={{ minHeight: '100px', height: 'auto', overflow: 'hidden' }}
              value={editableResume?.objective || ""}
              onChange={e => setEditableResume(prev => ({ ...prev, objective: e.target.value }))}
              placeholder="Enter your career objective (optional)"
              rows={1}
              onInput={e => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md w-full mb-6 max-w-5xl mx-auto">
            <h3 className="text-xl font-semibold mb-2">Biography</h3>
            <textarea
              className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:outline-none focus:bg-gray-600 resize-y"
              style={{ minHeight: '100px', height: 'auto', overflow: 'hidden' }}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Enter your biography (optional)"
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

          <div className="flex gap-4 mt-6 max-w-3xl mx-auto">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
            >
              Upload Different Resume
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Save Resume
            </button>
          </div>
        </div>

        )}
        {!uploaded && resumeList.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-indigo-700 dark:text-indigo-300">Load a Saved Resume:</label>
            <select
              className="w-full p-2 rounded border border-indigo-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              value={selectedResumeId || ""}
              onChange={e => handleLoadResume(e.target.value)}
            >
              <option value="">Select a resume...</option>
              {resumeList.map((resume) => (
                <option key={resume.resumeId} value={resume.resumeId}>
                  {resume.objective?.slice(0, 30) || resume.resumeId}
                </option>
              ))}
            </select>
          </div>
        )}
            {parsedResume && parsedResume.fileName && (
              <div className="text-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium mt-2 px-3 py-1 rounded shadow inline-block">
                Uploaded File: <span className="font-semibold">{parsedResume.fileName}</span>
              </div>
            )}
      </div>
    </main>
  );
}
