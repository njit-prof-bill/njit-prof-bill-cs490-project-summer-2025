// src/components/profile/jobHistorySection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building,
  User,
} from "lucide-react";
import { useProfile, JobEntry } from "@/context/profileContext";
import JobEntryForm from "./jobEntryForm";

const JobHistorySection: React.FC = () => {
  const { activeProfile, deleteJobEntry } = useProfile();
  const [editingJob, setEditingJob] = useState<JobEntry | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Whenever we switch to a different profile, close any open form
  useEffect(() => {
    setEditingJob(null);
    setShowAddForm(false);
  }, [activeProfile]);

  const handleEdit = (job: JobEntry) => {
    setEditingJob(job);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this job entry?")) {
      deleteJobEntry(id);
    }
  };

  const handleCloseForm = () => {
    setEditingJob(null);
    setShowAddForm(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
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
            Job History
          </h2>
          <p className="text-muted-foreground">
            Manage your work experience and professional background
          </p>
        </div>
        <button
          onClick={() => {
            setEditingJob(null);
            setShowAddForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Job</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {(showAddForm || editingJob) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <JobEntryForm job={editingJob} onClose={handleCloseForm} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job List */}
      <div className="space-y-4">
        {activeProfile.jobHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No job history yet</p>
            <p>Add your first job experience to get started</p>
          </div>
        ) : (
          activeProfile.jobHistory.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-neutral-800 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Building className="h-5 w-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">
                      {job.company}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3 mb-2">
                    <User className="h-4 w-4 text-white" />
                    <p className="text-white font-medium">{job.title}</p>
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="h-4 w-4 text-white" />
                    <p className="text-sm text-white">
                      {formatDate(job.startDate)} –{" "}
                      {job.endDate ? formatDate(job.endDate) : "Present"}
                    </p>
                  </div>

                  <p className="text-white mb-3">{job.description}</p>

                  {job.accomplishments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">
                        Key Accomplishments:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {job.accomplishments.map((a, i) => (
                          <li key={i} className="text-sm text-white">
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(job)}
                    className="p-2 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
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

      {/* Pro Tips */}
      <div className="border border-blue-500 rounded-lg p-4">
        <h4 className="font-semibold text-green-400 mb-3">💼 Job History Tips:</h4>
        <ul className="text-sm text-neutral-200 space-y-1">
          <li>• List jobs in reverse chronological order (most recent first)</li>
          <li>• Include specific accomplishments with numbers when possible</li>
          <li>• Use action verbs to describe your responsibilities</li>
          <li>• Focus on achievements rather than just duties</li>
          <li>• Keep descriptions concise but informative</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default JobHistorySection;
