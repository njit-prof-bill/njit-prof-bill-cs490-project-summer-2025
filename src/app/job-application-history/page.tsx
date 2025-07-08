"use client";
import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

type Application = {
  id: string;
  title: string;
  company: string;
  createdAt: number;
  jobText?: string;
  location?: string;
  pay?: string;
  overview?: string;
  expectations?: string;
};

export default function JobApplicationHistoryPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/jobAd?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.jobAds || []);
        setLoading(false);
      });
  }, [userId]);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-500">
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Job Application History
        </h1>
        {loading ? (
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">
            You have not applied to any jobs yet.
          </p>
        ) : (
          <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Job Title</th>
                <th className="py-2 px-4 text-left">Company</th>
                <th className="py-2 px-4 text-left">Date Applied</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="py-2 px-4">{app.title}</td>
                  <td className="py-2 px-4">{app.company}</td>
                  <td className="py-2 px-4">
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ""}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setSelectedApp(app)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal for details */}
        {selectedApp && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Close (X) button */}
              <button
                className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-white"
                onClick={() => setSelectedApp(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-2">{selectedApp.title}</h2>
              <p className="mb-1"><span className="font-semibold">Company:</span> {selectedApp.company}</p>
              <p className="mb-1"><span className="font-semibold">Date Applied:</span> {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleDateString() : ""}</p>
              {selectedApp.location && <p className="mb-1"><span className="font-semibold">Location:</span> {selectedApp.location}</p>}
              {selectedApp.pay && <p className="mb-1"><span className="font-semibold">Pay:</span> {selectedApp.pay}</p>}
              {selectedApp.overview && <p className="mb-1"><span className="font-semibold">Overview:</span> {selectedApp.overview}</p>}
              {selectedApp.expectations && <p className="mb-1"><span className="font-semibold">Expectations:</span> {selectedApp.expectations}</p>}
              {/* {selectedApp.jobText && (
                <div className="mt-2">
                  <span className="font-semibold">Full Job Description:</span>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto overflow-y-auto max-h-64">
                    {selectedApp.jobText}
                  </pre>
                </div>
              )} */}
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}