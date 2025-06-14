import React from "react";
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

export default function TestUIPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10">
  <div className="mx-auto max-w-5xl space-y-12">
    <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        Your Resume Overview
    </h1>


    <section className="bg-white/90 hover:bg-white transition rounded-xl shadow-md p-6 ring-1 ring-gray-200">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Career Objective</h2>
          <CareerObjective objective={mockObjective} />
          <RawToggle label="Career Objective" data={mockObjective} />
        </section>

    <section className="bg-white/90 hover:bg-white transition rounded-xl shadow-md p-6 ring-1 ring-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Contact Info</h2>
          <ContactCard contact={mockContact} />
          <RawToggle label="Contact Info" data={mockContact} />
        </section>

    <section className="bg-white/90 hover:bg-white transition rounded-xl shadow-md p-6 ring-1 ring-gray-200">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Education History</h2>
          <EducationList education={mockEducation} />
          <RawToggle label="Education History" data={mockEducation} />
        </section>

    <section className="bg-white/90 hover:bg-white transition rounded-xl shadow-md p-6 ring-1 ring-gray-200">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Job History</h2>
          <JobHistory />
          <RawToggle label="Job History" data={"Data pulled inside component"} />
        </section>

    <section className="bg-white/90 hover:bg-white transition rounded-xl shadow-md p-6 ring-1 ring-gray-200">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Skills</h2>
          <SkillsList skills={mockSkills} />
          <RawToggle label="Skills" data={mockSkills} />
        </section>
      </div>
    </main>
  );
}
