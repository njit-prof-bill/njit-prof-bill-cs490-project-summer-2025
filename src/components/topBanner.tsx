"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // Import Shadcn dropdown components
import { useRouter, usePathname } from "next/navigation"; // Import usePathname
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface TopBannerProps {
    toggleSidePanel: () => void;
    onForceHome: () => void;
}

export default function TopBanner({ toggleSidePanel, onForceHome }: TopBannerProps) {
    const router = useRouter();
    const pathname = usePathname(); // Get the current path

    // Get current user
    const user = auth.currentUser;

    // Helper to get initials from displayName
    const getInitials = (name?: string | null) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const initials = getInitials(user?.displayName).toLowerCase();


    // Map paths to page titles
    const pageTitles: { [key: string]: string } = {
        "/home": "Home",
        "/home/settings": "Settings",
    };

    const pageTitle = pageTitles[pathname] || "Page"; // Default to "Page" if no match

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/"); // Redirect to landing page
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    // Helper: always scroll to top when clicking home/logo
    const handleHomeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onForceHome();
    };

    return (
        <header className="z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md rounded-b-2xl mb-4 flex items-center justify-between px-4 md:px-8 py-3 md:py-5 border-b border-indigo-200 dark:border-gray-800">
            {/* Left Section: Hamburger Menu, Logo, and Breadcrumb */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleSidePanel}
                    className="p-2 rounded-md border-none hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                >
                    <Bars3Icon className="h-8 w-8 text-indigo-700 dark:text-indigo-300" />
                </button>
                <a href="/home" className="flex items-center cursor-pointer group" onClick={handleHomeClick}>
                    <Image
                        src="/logo.png"
                        alt="Polaris Home"
                        width={200}
                        height={200}
                        className="mr-4 rounded-full shadow-md border-2 border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-900"
                        priority
                    />
                </a>
                <div className="flex space-x-2 text-md">
                    <a href="/home" className="hover:underline text-indigo-700 dark:text-indigo-300 font-semibold cursor-pointer" onClick={handleHomeClick}>
                        {pageTitle}
                    </a>
                </div>
            </div>

            {/* Center Section: Title */}
            <div className="flex-grow flex justify-center">
                <h1 className="text-xl md:text-2xl font-bold dark:text-gray-100 tracking-tight bg-gradient-to-r from-indigo-500 via-blue-400 to-teal-400 bg-clip-text text-transparent drop-shadow-md">
                    Polaris Resume Builder
                </h1>
            </div>

            {/* Right Section: Avatar with Dropdown */}
            <div className="flex items-center relative">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="relative cursor-pointer">
                            <Avatar className="w-10 h-10 shadow-lg border-2 border-indigo-200 dark:border-indigo-700">
                                {/* <AvatarImage src="/path-to-avatar-image.jpg" alt="User Avatar" /> */}
                                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-blue-400 w-full h-full flex items-center justify-center rounded-full text-lg font-bold text-white">
                                    {initials || "?"}
                                </AvatarFallback>
                            </Avatar>
                            {/* Down Arrow Indicator */}
                            <span
                                className="absolute text-indigo-700 dark:text-indigo-200 text-xs"
                                style={{
                                    bottom: "-4px",
                                    right: "-4px",
                                }}
                            >
                                ▼
                            </span>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border border-indigo-100 dark:border-indigo-700 bg-white/95 dark:bg-gray-900/95">
                        <DropdownMenuItem onClick={() => router.push("/home/settings")}
                            className="hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-lg transition">
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}
                            className="hover:bg-pink-100 dark:hover:bg-pink-800 rounded-lg transition">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}