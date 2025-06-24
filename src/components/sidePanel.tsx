"use client";

import Link from "next/link"; // Import Next.js Link component

interface SidePanelProps {
    isSidePanelOpen: boolean;
}

export default function SidePanel({ isSidePanelOpen }: SidePanelProps) {
    return (
        <aside
            className={`bg-stone-100 dark:bg-stone-900 p-4 shadow transform transition-transform duration-300 ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
                } w-64 flex-shrink-0`}
        >
            <nav>
                <ul>
                    <li className="mb-2">
                        <Link href="/home" className="hover:underline">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link href="/home/settings" className="hover:underline">
                            Settings
                        </Link>
                    </li>
                    <li>
                        <Link href="/home/upload-resume" className="hover:underline">
                            Upload Resume
                        </Link>

                    </li>
                    <li>
                        <Link href="/home/upload-job-ad" className="hover:underline">
                            Upload Job Ad
                        </Link>
                    </li>  
                    <li>
                        <Link href="/home/view-job-ad" className="hover:underline">
                            View Job Ads
                        </Link>
                    </li>
                    <li>
                        <Link href="/home/free-form" className="hover:underline">
                            Write Free-form
                        </Link>
                    </li>
                    <li>
                        <Link href="/home/edit-contact-info" className="hover:underline">
                            Edit Contact Info
                        </Link>
                    </li>
                    <li>
                        <Link href="/home/edit-summary" className="hover:underline">
                            Edit Professional Summary
                        </Link>
                    </li>
                    <li>
                        <Link href="/home/edit-skills" className="hover:underline">
                            Edit Skills
                        </Link>
                    </li>
                    <li>
                        <Link href="/home/edit-education" className="hover:underline">
                            Edit Education
                        </Link>
                    </li>
                    <li>
                        <Link href="/home/edit-work-experience" className="hover:underline">
                            Edit Work Experience
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}