"use client";

import Link from "next/link"; // Import Next.js Link component

interface SidePanelProps {
    isSidePanelOpen: boolean;
    onForceHome: () => void;
    onClose: () => void; // Add onClose prop
}

export default function SidePanel({ isSidePanelOpen, onForceHome, onClose }: SidePanelProps) {
    return (
        <aside
            className={`sticky top-0 z-30 pt-20 h-screen bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-xl border-r-2 border-indigo-200 dark:border-indigo-800 rounded-r-3xl p-6 flex flex-col transition-all duration-300 ${isSidePanelOpen ? "block" : "hidden"} w-64 flex-shrink-0`}
            role="navigation"
            aria-label="Sidebar navigation"
        >
            <nav className="w-full mt-4 flex-1 overflow-y-auto">
                <ul className="space-y-4">
                    <li>
                        <a href="/home" className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition cursor-pointer" onClick={(e) => { e.preventDefault(); onForceHome(); }}>
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M4 10v10a2 2 0 002 2h3m6 0h3a2 2 0 002-2V10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Dashboard
                        </a>
                    </li>
                    {/* Resume Section */}
                    <li>
                        <div className="mt-6 mb-2 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 select-none">Resume</div>
                        <ul className="space-y-1 ml-2">
                            <li>
                                <button type="button" className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition" onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-resume-section', { detail: 'contact' }))}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 12a4 4 0 01-8 0V8a4 4 0 018 0v4z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    Contact
                                </button>
                            </li>
                            <li>
                                <button type="button" className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-orange-700 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-800 transition" onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-resume-section', { detail: 'objective' }))}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#f59e42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    Objective
                                </button>
                            </li>
                            <li>
                                <button type="button" className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-emerald-700 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition" onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-resume-section', { detail: 'skills' }))}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2l4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    Skills
                                </button>
                            </li>
                            <li>
                                <button type="button" className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition" onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-resume-section', { detail: 'education' }))}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 20v-6m0 0V4m0 10l-4-4m4 4l4-4" stroke="#f59e42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    Education
                                </button>
                            </li>
                            <li>
                                <button type="button" className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition" onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-resume-section', { detail: 'jobs' }))}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M4 17v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    Job History
                                </button>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <Link href="/home/job-ads" className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-800 transition">
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17 9V7a5 5 0 00-10 0v2M5 9h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9z" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Job Ads
                        </Link>
                    </li>
                    <li>
                        <Link href="/home/settings" className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800 transition">
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7zm7.94-2.06a1 1 0 00.26-1.09l-1.43-4.14a1 1 0 00-.76-.65l-4.14-1.43a1 1 0 00-1.09.26l-2.83 2.83a1 1 0 00-.26 1.09l1.43 4.14a1 1 0 00.76.65l4.14 1.43a1 1 0 001.09-.26l2.83-2.83z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Settings
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}