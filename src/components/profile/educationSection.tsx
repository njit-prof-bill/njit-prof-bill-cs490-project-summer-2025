// src/components/profile/educationSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { useProfile, EducationEntry } from "@/context/profileContext";
import EducationEntryForm from "./educationEntryForm";

const EducationSection: React.FC = () => {
  const { activeProfile, deleteEducationEntry } = useProfile();
  const [editingEducation, setEditingEducation] = useState<EducationEntry | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Close any open form when switching profiles
  useEffect(() => {
    setEditingEducation(null);
    setShowAddForm(false);
  }, [activeProfile]);

  const handleEdit = (education: EducationEntry) => {
    setEditingEducation(education);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this education entry?")) {
      deleteEducationEntry(id);
    }
  };

  const handleCloseForm = () => {
    setEditingEducation(null);
    setShowAddForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Education
          </h2>
          <p className="text-muted-foreground">
            Manage your educational background and qualifications
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEducation(null);
            setShowAddForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Education</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {(showAddForm || editingEducation) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <EducationEntryForm
              education={editingEducation}
              onClose={handleCloseForm}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Education List */}
      <div className="space-y-4">
        {activeProfile.education.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-white" />
            <p className="text-lg font-medium mb-2">No education entries yet</p>
            <p>Add your educational background to get started</p>
          </div>
        ) : (
          activeProfile.education.map((education, index) => (
            <motion.div
              key={education.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-neutral-800 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <GraduationCap className="h-5 w-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">
                      {education.school}
                    </h3>
                  </div>

                  <p className="text-white font-medium mb-2">
                    {education.degree}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-white">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{education.dates}</span>
                    </div>
                    {education.gpa && (
                      <div>
                        <span className="font-medium">GPA: {education.gpa}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(education)}
                    className="p-2 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(education.id)}
                    className="p-2 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Tips */}
      <div className="rounded-lg p-4 border border-blue-500">
        <h4 className="font-semibold text-purple-500 mb-2">🎓 Education Tips:</h4>
        <ul className="text-sm text-neutral-200 space-y-1">
          <li>• List education in reverse chronological order (most recent first)</li>
          <li>• Include relevant coursework, honors, or achievements</li>
          <li>• Add GPA if it’s 3.5 or higher (or equivalent)</li>
          <li>• Include certifications, bootcamps, and professional development</li>
          <li>• Don’t forget relevant online courses or training</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default EducationSection;
