import { useState } from "react";
import Reorder from "../components/Reorder";
import ReorderEducation from "../components/ReorderEducation";
import ReorderWorkExperience from "@/components/ReorderWorkExperience";
import FetchAndDisplayKey from "../components/FetchAndDisplayKey";
import SummaryDisplay from "@/components/SummaryDisplay";
import SummaryEditor from "@/components/SummaryEditor";

interface ProfileCardProps {
  deduplicateSkills: (skills: string[]) => string[];
}

export default function UserProfile({ deduplicateSkills }: ProfileCardProps) {
  const [activeTab, setActiveTab] = useState("contact");

  const tabLabels: { [key: string]: string } = {
    contact: "Contact Info",
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Tab Navigation */}
      <div className="relative z-10 flex space-x-4 bg-[#1B1917] rounded-t-xl px-4 pt-4 -mb-px">
        {Object.keys(tabLabels).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium transition-all duration-200 rounded-t-md ${
              activeTab === tab
                ? "bg-[#2A2A2E] text-[#F09E38]"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab Panel Container */}
      <div className="relative min-h-[300px] bg-[#2A2A2E] rounded-b-xl p-6 transition-all duration-300">
        {activeTab === "contact" && (
          <div className="animate-fade-in space-y-6 max-w-4xl mx-auto mt-2">
            {/* Full Name */}
            <h2 className="text-2xl font-bold mb-4 text-white">Full Name</h2>
            <div className="p-6 bg-[#1B1917] border border-gray-700 rounded-lg shadow-sm">
              <FetchAndDisplayKey keyPath="fullName" />
            </div>

            {/* Email */}
            <h2 className="text-2xl font-bold mb-4 text-white">Email</h2>
            <div className="p-6 bg-[#1B1917] border border-gray-700 rounded-lg shadow-sm">
              <FetchAndDisplayKey keyPath="contact.email" />
            </div>

            {/* Phone */}
            <h2 className="text-2xl font-bold mb-4 text-white">Phone</h2>
            <div className="p-6 bg-[#1B1917] border border-gray-700 rounded-lg shadow-sm">
              <FetchAndDisplayKey keyPath="contact.phone" />
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="animate-fade-in w-full max-w-4xl mx-auto mt-2">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Summary/Career Objective
            </h2>
            <SummaryDisplay className="p-6 bg-[#1B1917] border border-gray-700 rounded-lg shadow-sm" />
            <div className="mt-4">
              <SummaryEditor />
            </div>
          </div>
        )}

        {activeTab === "experience" && (
          <div className="animate-fade-in mt-2">
            <ReorderWorkExperience />
          </div>
        )}

        {activeTab === "education" && (
          <div className="animate-fade-in mt-2">
            <ReorderEducation />
          </div>
        )}

        {activeTab === "skills" && (
          <div className="animate-fade-in w-full max-w-4xl mx-auto mt-2">
            <Reorder tag="skills" />
          </div>
        )}
      </div>
    </div>
  );
}
