// components/TopBanner.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { LoginForm } from "@/components/forms/loginForm";

export default function TopBanner() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/homepage" className="flex items-center space-x-2">
          <Image
            src="/kaizologo.png"
            alt="Kaizo Resume Builder logo"
            width={180}
            height={20}
          />
        </Link>

        {/* Navigation */}
        <div className="flex space-x-4 items-center">
          <Link
            href="/examples"
            className="inline-block border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 rounded-md"
          >
            See Examples
          </Link>

          {/* Login Popover */}
          <Popover open={showLogin} onOpenChange={setShowLogin}>
            <PopoverTrigger asChild>
              <button
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md"
              >
                Log In
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={10}
              className="w-80 p-4 bg-white shadow-lg rounded-lg border"
            >
              <LoginForm
                onLogin={() => {
                  setShowLogin(false);
                }}
                onForgotPassword={() => {
                  // Redirect to the dedicated page, do NOT close the popover
                  window.location.href = "/?view=resetPassword";
                }}
              />

              {/* Divider */}
              <div className="my-3 border-t border-gray-300" />

              {/* Go to full login page */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/?view=login";
                  }}
                  className="text-sm text-blue-500 hover:underline"
                >
                  More options
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
