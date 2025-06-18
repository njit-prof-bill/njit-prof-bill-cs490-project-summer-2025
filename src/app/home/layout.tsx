"use client";

import { ReactNode, useState } from "react";
import TopBanner from "@/components/topBanner";
import SidePanel from "@/components/sidePanel";
import { useRouter } from "next/navigation";

export default function HomeLayout({ children }: { children: ReactNode }) {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
    const router = useRouter();

    // This will be passed down to force home state
    const handleForceHome = () => {
        // Use a custom event to notify the page
        window.dispatchEvent(new Event("force-home"));
        router.push("/home");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const toggleSidePanel = () => {
        setIsSidePanelOpen((prev) => {
            return !prev;
        });
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Banner */}
            <TopBanner toggleSidePanel={toggleSidePanel} onForceHome={handleForceHome} />

            {/* Main Layout */}
            <div className="flex flex-1">
                {/* Side Navigation */}
                <SidePanel isSidePanelOpen={isSidePanelOpen} onForceHome={handleForceHome} />

                {/* Main Content */}
                <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}