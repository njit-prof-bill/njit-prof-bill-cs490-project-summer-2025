"use client";

import { ReactNode, useState } from "react";
import TopBanner from "@/components/topBanner";
import SidePanel from "@/components/sidePanel";
import { ToastProvider } from "@/context/toastContext";
import { ProfileProvider } from "@/context/profileContext";

export default function HomeLayout({ children }: { children: ReactNode }) {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  const toggleSidePanel = () => setIsSidePanelOpen((prev) => !prev);

  return (
    <ToastProvider>
      <ProfileProvider>
        <div className="flex flex-col min-h-screen">
          {/* Top Banner */}
          <TopBanner toggleSidePanel={toggleSidePanel} />

          {/* Main Layout */}
          <div className="flex flex-1">
            {/* Side Navigation */}
            <SidePanel isSidePanelOpen={isSidePanelOpen} />

            {/* Main Content */}
            <main className="flex-1 p-4">
              {children}
            </main>
          </div>
        </div>
      </ProfileProvider>
    </ToastProvider>
  );
}
