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

    const user = auth.currentUser;

    const getInitials = (name?: string | null) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const initials = getInitials(user?.displayName).toLowerCase();

    const pageTitles: { [key: string]: string } = {
        "/home": "Home",
        "/home/settings": "Settings",
    };

    const pageTitle = pageTitles[pathname] || "Page";

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Ensure a full reload to clear all user state
            window.location.href = "/homepage";
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    return (
        <header className="bg-stone-200 dark:bg-stone-800 p-2 shadow border-b border-stone-600 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleSidePanel}
                    className="p-2 rounded-md border-none hover:bg-stone-300 dark:hover:bg-stone-700"
                >
                    <Bars3Icon className="h-9 w-9 text-gray-800 dark:text-gray-200" />
                </button>
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.png"
                        alt="Marcus Home"
                        width={48}
                        height={48}
                        className="mr-2"
                    />
                </Link>
                <div className="flex space-x-2 text-md">
                    <p>{pageTitle}</p>
                </div>
            </div>

            <div className="flex-grow flex justify-center">
                <h1 className="text-xl font-semibold">Kaizo Resume Builder</h1>
            </div>

            <div className="flex items-center relative">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="relative cursor-pointer">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src="/path-to-avatar-image.jpg" alt="User Avatar" />
                                <AvatarFallback className="bg-blue-500 w-full h-full flex items-center justify-center rounded-full">
                                    {initials || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <span
                                className="absolute text-gray-800 dark:text-gray-200 text-xs"
                                style={{
                                    bottom: "-4px",
                                    right: "-4px",
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
