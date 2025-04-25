"use client";

import { ReactNode, useState } from "react";
import TopBanner from "@/components/topBanner"; // Import the new TopBanner component

export default function HomeLayout({ children }: { children: ReactNode }) {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    const toggleSidePanel = () => {
        setIsSidePanelOpen((prev) => {
            console.log("Side panel toggled:", !prev); // Debugging
            return !prev;
        });
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Banner */}
            <TopBanner toggleSidePanel={toggleSidePanel} />

            {/* Main Layout */}
            <div className="flex flex-1">
                {/* Side Navigation */}
                <aside
                    className={`bg-stone-100 dark:bg-stone-900 p-4 shadow transform transition-transform duration-300 ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
                        } w-64 flex-shrink-0`}
                >
                    <nav>
                        <ul>
                            <li className="mb-2">
                                <a href="#" className="hover:underline">
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Settings
                                </a>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}