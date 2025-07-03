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
            className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-xl border-r-2 border-indigo-200 dark:border-indigo-800 rounded-r-3xl p-6 flex flex-col items-start transition-all duration-300 ${isSidePanelOpen ? "block" : "hidden"} w-64 flex-shrink-0`}
            role="navigation"
            aria-label="Sidebar navigation"
        >
            <nav className="w-full mt-4">
                <ul className="space-y-4">
                    <li>
                        <a href="/home" className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition cursor-pointer" onClick={(e) => { e.preventDefault(); onForceHome(); }}>
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M4 10v10a2 2 0 002 2h3m6 0h3a2 2 0 002-2V10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Dashboard
                        </a>
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