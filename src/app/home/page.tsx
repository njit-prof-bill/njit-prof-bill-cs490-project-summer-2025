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
    email?: string;
    phone?: string;
    objective?: string;
    skills?: string[];
    jobHistory?: any[];
    education?: any[];
  } | null>(null);

  const [editableResume, setEditableResume] = useState<typeof parsedResume>(null);

  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleViewBreakdown = () => {
    setEditableResume(parsedResume);
    setUploaded(true);
  };

  const handleReset = () => {
    setUploaded(false);
    setParsedResume(null);
    setEditableResume(null);
    setBio("");
  };

  const handleSave = async () => {
    try {
      const dataToSave = { ...editableResume, bio };

      const res = await fetch("/api/saveResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });
      if (!res.ok) throw new Error("Save failed");
      alert("Resume saved successfully!");
    } catch (error) {
      if (error instanceof Error) {
        alert("Error saving resume: " + error.message);
      } else {
        alert("Error saving resume: " + String(error));
      }
    }
  };

  if (loading) return <p>Loading... This may take awhile!</p>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-12">
        {!uploaded ? (
          <>
            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
              Welcome to Your Personalized Resume Builder
            </h1>

            <div className="w-full max-w-md mx-auto space-y-8">
              <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4 text-center">
                  Upload Your Resume
                </h2>

                <FileUpload onParsed={setParsedResume} />
              </div>

              <div>
                <BioSubmission
                  bio={bio}
                  setBio={setBio}
                  onSubmitSuccess={(submitted) => setSubmittedBio(submitted)}
                  showSubmitButton={true}
                />
              </div>

              <button
                onClick={handleViewBreakdown}
                disabled={!parsedResume}
                className={`w-full px-4 py-2 rounded text-white ${
                  parsedResume
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                View Resume Breakdown
              </button>
            </div>
          </>
        ) : (
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-8 space-y-8">
          <ContactCard
            contact={{
              email: editableResume?.email || "",
              phone: editableResume?.phone || "",
            }}
            onChange={(newContact) =>
              setEditableResume((prev) => ({
                ...prev,
                email: newContact.email,
                phone: newContact.phone,
              }))
            }
          />
          <div className="max-w-3xl mx-auto mb-6">
            <BioSubmission bio={bio} setBio={setBio} showSubmitButton={false} />
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
      </div>
    </main>
  );
}
