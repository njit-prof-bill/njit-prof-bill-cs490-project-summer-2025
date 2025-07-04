"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Upload,
    Briefcase,
    Eye,
    Edit,
    User,
    GraduationCap,
    Wrench,
    Clock,
    Settings,
    FileText,
    Building,
} from "lucide-react";

interface SidePanelProps {
    isSidePanelOpen: boolean;
}

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navigationSections: NavSection[] = [
    {
        title: "Main",
        items: [
            { href: "/home", label: "Dashboard", icon: Home },
            { href: "/home/settings", label: "Settings", icon: Settings },
        ],
    },
    {
        title: "Documents",
        items: [
            { href: "/home/upload-resume", label: "Upload Resume", icon: Upload },
            { href: "/home/upload-job-ad", label: "Upload Job Ad", icon: Briefcase },
            { href: "/home/view-job-ad", label: "View Job Ads", icon: Eye },
            { href: "/home/view-past-uploads", label: "Past Uploads", icon: Clock },
        ],
    },
    {
        title: "Profile Editor",
        items: [
            { href: "/home/edit-contact-info", label: "Contact Info", icon: User },
            { href: "/home/edit-summary", label: "Professional Summary", icon: FileText },
            { href: "/home/edit-skills", label: "Skills", icon: Wrench },
            { href: "/home/edit-education", label: "Education", icon: GraduationCap },
            { href: "/home/edit-work-experience", label: "Work Experience", icon: Building },
            { href: "/home/free-form", label: "Free-form Resume", icon: Edit },
        ],
    },
];

export default function SidePanel({ isSidePanelOpen }: SidePanelProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg transform transition-all duration-300 ease-in-out ${
                isSidePanelOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"
            } flex-shrink-0 overflow-hidden min-h-full`}
        >
            <div className="p-6 h-full flex flex-col w-64 overflow-y-auto">
                {/* Logo/Brand Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        Resume Builder
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Your career companion
                    </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-6 flex-1">
                    {navigationSections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                                {section.title}
                            </h3>
                            <ul className="space-y-1">
                                {section.items.map((item, itemIndex) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    
                                    return (
                                        <li key={itemIndex}>
                                            <Link
                                                href={item.href}
                                                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                                                    isActive
                                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-700 dark:border-blue-400"
                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                                                }`}
                                            >
                                                <Icon
                                                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                                                        isActive
                                                            ? "text-blue-700 dark:text-blue-400"
                                                            : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                                                    }`}
                                                />
                                                <span className="truncate">{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
}