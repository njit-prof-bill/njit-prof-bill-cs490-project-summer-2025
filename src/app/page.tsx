"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/forms/loginForm";
import { RegistrationForm } from "@/components/forms/registrationForm";
import { ResetPasswordForm } from "@/components/forms/resetPasswordForm";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<"login" | "register" | "resetPassword">("login");
  const [isMounted, setIsMounted] = useState(false);

  // Handle authenticated redirect
  useEffect(() => {
    if (!loading && user) {
      router.push("/home");
    }
  }, [user, loading, router]);

  // Detect changes to URL manually
  useEffect(() => {
    const handleRouteChange = () => {
      const params = new URLSearchParams(window.location.search);
      const queryView = params.get("view");

      if (queryView === "register") {
        setView("register");
      } else if (queryView === "resetPassword") {
        setView("resetPassword");
      } else {
        setView("login");
      }
    };

    handleRouteChange();

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("pushstate", handleRouteChange);
    window.addEventListener("replacestate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("pushstate", handleRouteChange);
      window.removeEventListener("replacestate", handleRouteChange);
    };
  }, []);

  // Enable transition
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Animated Container */}
      <div
        className={`
          relative z-10 w-full max-w-md p-6 bg-white dark:bg-stone-900 rounded-lg shadow-lg
          transform transition duration-500 ease-out
          ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        {/* Branding */}
        <div className="flex justify-center mb-4">
          <Link href="/homepage" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Kaizo Logo" width={48} height={48} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Kaizo Resume Builder
            </h2>
          </Link>
        </div>

        {view === "login" && (
          <>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Sign in
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              New to this app?{" "}
              <button
                onClick={() => setView("register")}
                className="text-blue-500 hover:underline"
              >
                Sign up for an account
              </button>
            </p>
            <LoginForm
              onLogin={() => router.push("/home")}
              onForgotPassword={() => setView("resetPassword")}
            />
          </>
        )}

        {view === "register" && (
          <>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Sign up
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Already have an account?{" "}
              <button
                onClick={() => setView("login")}
                className="text-blue-500 hover:underline"
              >
                Sign in
              </button>
            </p>
            <RegistrationForm onRegister={() => setView("login")} />
          </>
        )}

        {view === "resetPassword" && (
          <>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Reset your password
            </h1>
            <ResetPasswordForm
              onSuccess={() => setView("login")}
              buttonText="Send reset link"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Remembered?{" "}
              <button
                onClick={() => setView("login")}
                className="text-blue-500 hover:underline"
              >
                Go back to sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
