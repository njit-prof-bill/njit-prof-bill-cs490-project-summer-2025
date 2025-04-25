"use client";

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
    );
}