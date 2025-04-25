"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

interface TopBannerProps {
    toggleSidePanel: () => void;
}

export default function TopBanner({ toggleSidePanel }: TopBannerProps) {
    return (
        <header className="bg-stone-200 dark:bg-stone-800 p-4 shadow border-b border-stone-600 flex items-center">
            {/* Hamburger Menu */}
            <button
                onClick={toggleSidePanel}
                className="mr-4 p-2 rounded-md hover:bg-stone-300 dark:hover:bg-stone-700"
            >
                <Bars3Icon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            </button>

            {/* App Logo */}
            <Link href="/" className="flex items-center">
                <Image
                    src="/logo.png"
                    alt="Marcus Home"
                    width={32}
                    height={32}
                    className="mr-4"
                />
            </Link>

            {/* App Title */}
            <h1 className="text-xl text-center flex-1">Marcus</h1>
        </header>
    );
}