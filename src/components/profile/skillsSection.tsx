// src/components/profile/SkillsSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, GripVertical } from "lucide-react";
import { useProfile } from "@/context/profileContext";

const SkillsSection: React.FC = () => {
  // pull the active profile and the updater from context
  const { activeProfile, updateSkills } = useProfile();

  // local copy of the skills array, synced to context
  const [skills, setSkills] = useState<string[]>(activeProfile.skills);
  const [newSkill, setNewSkill] = useState("");

  // whenever the active profile changes, reset our local list
  useEffect(() => {
    setSkills(activeProfile.skills);
  }, [activeProfile.skills]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      updateSkills(updated);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    updateSkills(updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Skills</h2>
        <p className="text-muted-foreground">
          Manage your professional skills and competencies
        </p>
      </div>

      {/* Add New Skill */}
      <div className="bg-neutral-800 rounded-lg p-4">
        <label className="block text-sm font-medium mb-2">
          Add New Skill
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a skill (e.g., JavaScript, Project Management)"
          />
          <button
            onClick={addSkill}
            disabled={!newSkill.trim() || skills.includes(newSkill.trim())}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
        {newSkill.trim() && skills.includes(newSkill.trim()) && (
          <p className="mt-1 text-sm text-red-600">
            This skill already exists
          </p>
        )}
      </div>

      {/* Skills List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Your Skills ({skills.length})
          </h3>
          {skills.length > 0 && (
            <p className="text-sm text-muted-foreground">Drag to reorder</p>
          )}
        </div>

        {skills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No skills added yet. Add your first skill above!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {skills.map((skill) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center space-x-3 p-3 bg-neutral-800 border hover:ring-2 hover:ring-blue-500 rounded-lg hover:shadow-sm transition-shadow"
              >
                <button
                  className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <span className="flex-1">{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Categories & Suggestions (unchanged below) */}
      {/* … */}
    </motion.div>
  );
};

export default SkillsSection;
