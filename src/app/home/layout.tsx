"use client";

import { ReactNode, useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline"; // Import a hamburger menu icon

export default function HomeLayout({ children }: { children: ReactNode }) {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false); // State to track side panel visibility

    const toggleSidePanel = () => {
        setIsSidePanelOpen((prev) => {
            console.log("Side panel toggled:", !prev); // Debugging
            return !prev;
        });
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Banner */}
            <header className="bg-stone-200 dark:bg-stone-800 p-4 shadow border-b border-stone-600 flex items-center">
                {/* Hamburger Menu */}
                <button
                    onClick={toggleSidePanel}
                    className="mr-4 p-2 rounded-md hover:bg-stone-300 dark:hover:bg-stone-700"
                >
                    <Bars3Icon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                </button>
                <h1 className="text-xl font-bold text-center flex-1">Marcus App</h1>
            </header>

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