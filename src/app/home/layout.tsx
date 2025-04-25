"use client";

import { ReactNode } from "react";

export default function HomeLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Placeholder for the banner */}
            <header className="bg-stone-200 dark:bg-stone-800 p-4 shadow border-b border-stone-600">
                <h1 className="text-xl font-bold text-center">Marcus App</h1>
            </header>

            <div className="flex flex-1">
                {/* Placeholder for the side navigation */}
                <aside className="w-64 bg-stone-100 dark:bg-stone-900 p-4 shadow hidden md:block">
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

                {/* Main content */}
                <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}