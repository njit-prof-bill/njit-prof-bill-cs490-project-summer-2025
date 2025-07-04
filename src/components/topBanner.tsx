"use client";

import { Menu, Settings, LogOut, Home, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface TopBannerProps {
    toggleSidePanel: () => void;
}

export default function TopBanner({ toggleSidePanel }: TopBannerProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Get current user
    const user = auth.currentUser;

    // Helper to get initials from displayName
    const getInitials = (name?: string | null) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const initials = getInitials(user?.displayName);

    // Map paths to page titles
    const pageTitles: { [key: string]: string } = {
        "/home": "Dashboard",
        "/home/settings": "Settings",
        "/home/upload-resume": "Upload Resume",
        "/home/upload-job-ad": "Upload Job Ad",
        "/home/view-job-ad": "View Job Ads",
        "/home/free-form": "Free-form Resume",
        "/home/edit-contact-info": "Contact Information",
        "/home/edit-summary": "Professional Summary",
        "/home/edit-skills": "Skills",
        "/home/edit-education": "Education",
        "/home/edit-work-experience": "Work Experience",
        "/home/view-past-uploads": "Past Uploads",
    };

    const pageTitle = pageTitles[pathname] || "Dashboard";

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
                {/* Left Section: Menu, Logo, and Page Title */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleSidePanel}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    
                    <Link href="/home" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <Image
                            src="/new-logo.png"
                            alt="Pisces Logo"
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Pisces
                            </h1>
                        </div>
                    </Link>
                    
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Home className="h-4 w-4" />
                            <span>/</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                                {pageTitle}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center Section: Page Title for mobile */}
                <div className="md:hidden">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {pageTitle}
                    </h2>
                </div>

                {/* Right Section: User Menu */}
                <div className="flex items-center space-x-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user?.photoURL || ""} alt="User Avatar" />
                                    <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                                        {initials || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block text-left">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user?.displayName || "User"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {user?.email}
                                    </div>
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                                Signed in as
                            </div>
                            <div className="px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user?.email}
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/home/settings")}>
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}