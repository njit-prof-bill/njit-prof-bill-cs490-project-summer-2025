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
        <header className="bg-stone-200 dark:bg-stone-800 p-4 shadow border-b border-stone-600 flex items-center justify-between">
            {/* Left Section: Hamburger Menu, Logo, and Breadcrumb */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleSidePanel}
                    className="p-2 rounded-md border-none hover:bg-stone-300 dark:hover:bg-stone-700"
                >
                    <Bars3Icon className="h-9 w-9 text-gray-800 dark:text-gray-200" />
                </button>
                <a href="/home" className="flex items-center cursor-pointer" onClick={handleHomeClick}>
                    <Image
                        src="/logo.png"
                        alt="Polaris Home"
                        width={150}
                        height={150}
                        className="mr-2 cursor-pointer"
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
                <h1 className="text-xl font-semibold">Polaris Resume Builder</h1>
            </div>

            {/* Right Section: Avatar with Dropdown */}
            <div className="flex items-center relative">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="relative cursor-pointer">
                            <Avatar className="w-10 h-10">
                                {/* <AvatarImage src="/path-to-avatar-image.jpg" alt="User Avatar" /> */}
                                <AvatarFallback className="bg-blue-500 w-full h-full flex items-center justify-center rounded-full">
                                    {initials || "?"}
                                </AvatarFallback>
                            </Avatar>
                            {/* Down Arrow Indicator */}
                            <span
                                className="absolute text-gray-800 dark:text-gray-200 text-xs"
                                style={{
                                    bottom: "-4px", // Move the arrow slightly lower
                                    right: "-4px",  // Move the arrow slightly to the right
                                }}
                            >
                                ▼
                            </span>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => router.push("/home/settings")}>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}