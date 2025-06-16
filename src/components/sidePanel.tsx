"use client";

import Link from "next/link"; // Import Next.js Link component

interface SidePanelProps {
    isSidePanelOpen: boolean;
}

export default function SidePanel({ isSidePanelOpen }: SidePanelProps) {
    return (
        <aside
            className={`
                bg-stone-100 dark:bg-stone-900 
                p-4 shadow 
                transform transition-all duration-300 
                overflow-hidden 
                ${isSidePanelOpen ? "translate-x-0 w-64" : "w-0"} 
                flex-shrink-0
            `}
            /*
                Light mode background (light gray), Dark mode background (almost black).
                Adds 1rem of padding on all sides, Applies a basic box shadow for subtle elevation
                Enables translate-x utility to work, Allows smooth transition of all animatable properties (like width), Transition duration is 300ms
                Prevents child content from spilling when width: 0
                No translation → panel is visible and 64 width, 0 width (Moves panel left by 100% of its own width → off-screen (-translate-x-full)) 
                Prevents the panel from shrinking when the parent container is resized
            */
        >
            <div className="transition-opacity duration-300 ease-in-out">
                {isSidePanelOpen && (
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
                )}
            </div>
        </aside>
    );
}