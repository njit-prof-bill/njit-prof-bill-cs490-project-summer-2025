"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

interface TopBannerProps {
    toggleSidePanel: () => void;
}

export default function TopBanner({ toggleSidePanel }: TopBannerProps) {
    const pathname = usePathname();

    // Dynamically generate breadcrumb items based on the current path
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/");
        const isLast = index === pathSegments.length - 1;

        return (
            <BreadcrumbItem key={href}>
                {isLast ? (
                    <span className="text-gray-400">{segment.charAt(0).toUpperCase() + segment.slice(1)}</span>
                ) : (
                    <Link href={href} className="text-gray-600 hover:underline capitalize">
                        {segment.charAt(0).toUpperCase() + segment.slice(1)}
                    </Link>
                )}
            </BreadcrumbItem>
        );
    });

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
                    <p>Home</p>
                </div>
            </div>

            {/* Center Section: Title */}
            <div className="flex-grow flex justify-center">
                <h1 className="text-xl font-semibold">Marcus</h1>
            </div>

            {/* Right Section: Placeholder for Future Items */}
            <div className="flex items-center">
                <span className="text-gray-400">Right Section</span>
            </div>
        </header>
    );
}