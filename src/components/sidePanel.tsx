"use client";

import { usePathname } from "next/navigation";
import Link from "next/link"; // Import Next.js Link component

interface SidePanelProps {
    isSidePanelOpen: boolean;
}

const SECTIONS = [
    { key: "contact", label: "Contact" },
    { key: "objective", label: "Objective" },
    { key: "skills", label: "Skills" },
    { key: "jobs", label: "Jobs" },
    { key: "education", label: "Education" },
  ] as const;  

export default function SidePanel({ isSidePanelOpen }: SidePanelProps) {
    const pathname = usePathname();              // e.g. "/home/profile"
    const onProfilePage = pathname === "/home/profile";
  
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
                    <li className="mb-4">
                        <Link href="/home/settings" className="hover:underline">
                            Settings
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link href="/home/profile" className="hover:underline">
                            Profile
                        </Link>
                    </li>
                    {SECTIONS.map(({ key, label }) => (
                        <li key={key} className="mb-2 pl-2">
                            {onProfilePage ? (
                                // Same page → plain anchor for instant hash navigation
                                <a href={`#${key}`} className="hover:underline">
                                    {label}
                                </a>
                            ) : (
                                // Off-page → client-side Link to /home/profile#key
                                <Link href={`/home/profile#${key}`} className="hover:underline">
                                    {label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}