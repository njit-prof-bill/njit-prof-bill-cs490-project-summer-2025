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
                </ul>
            </nav>
        </aside>
    );
}