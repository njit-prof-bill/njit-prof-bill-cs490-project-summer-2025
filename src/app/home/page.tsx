"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FileUpload from "@/components/FileUpload";
import BioSubmission from "@/components/forms/BioSubmission";

import SkillsList from "@/components/ui/SkillsList";
import { mockSkills } from "@/lib/mockSkills";
import { mockContact } from "@/lib/mockContact";
import { mockEducation } from "@/lib/mockEducation";
import ContactCard from "@/components/ContactCard";
import EducationList from "@/components/EducationList";
import JobHistory from "@/components/ui/JobHistory";
import CareerObjective from "@/components/ui/CareerObjective";
import { mockObjective } from "@/lib/mockObjective";
import RawToggle from "@/components/ui/RawToggle";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-12">
        {!uploaded ? (
          <>
            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Welcome to Marcus</h1>

            <div className="w-full max-w-md mx-auto space-y-8">
              <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4 text-center">Upload Your Resume</h2>
                <FileUpload />
              </div>

              <div>
                <BioSubmission />
              </div>

              <button
                onClick={() => setUploaded(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Simulate Submit & View Resume
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
              Your Resume Overview
            </h1>

            <section className="bg-white rounded-xl shadow-md p-6 ring-1 ring-gray-200">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Career Objective</h2>
              <CareerObjective objective={mockObjective} />
              <RawToggle label="Career Objective" data={mockObjective} />
            </section>

            <section className="bg-white rounded-xl shadow-md p-6 ring-1 ring-gray-200">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Contact Info</h2>
              <ContactCard contact={mockContact} />
              <RawToggle label="Contact Info" data={mockContact} />
            </section>

            <section className="bg-white rounded-xl shadow-md p-6 ring-1 ring-gray-200">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Education History</h2>
              <EducationList education={mockEducation} />
              <RawToggle label="Education History" data={mockEducation} />
            </section>

            <section className="bg-white rounded-xl shadow-md p-6 ring-1 ring-gray-200">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Job History</h2>
              <JobHistory />
              <RawToggle label="Job History" data="Pulled from JobHistory component" />
            </section>

            <section className="bg-white rounded-xl shadow-md p-6 ring-1 ring-gray-200">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Skills</h2>
              <SkillsList skills={mockSkills} />
              <RawToggle label="Skills" data={mockSkills} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
