"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/forms/loginForm";
import { RegistrationForm } from "@/components/forms/registrationForm";
import { ResetPasswordForm } from "@/components/forms/resetPasswordForm";
import Image from "next/image";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<"login" | "register" | "resetPassword">("login"); // State to toggle views

  useEffect(() => {
    if (!loading && user) {
      router.push("/home"); // Redirect to home page if authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Loading...</p>; // Show a loading state while checking auth
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-br from-indigo-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col items-center mb-10 relative">
        {/* Animated Gradient Glow Behind Logo */}
        <div className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="animate-spin-slow w-[240px] h-[240px] rounded-full bg-gradient-to-tr from-indigo-400 via-blue-300 to-pink-400 opacity-30 blur-2xl" />
        </div>
        {/* Fun Accent Icons */}
        <div className="absolute left-0 top-8 z-10">
          <span className="text-yellow-400 text-3xl animate-bounce">✨</span>
        </div>
        <div className="absolute right-0 top-16 z-10">
          <span className="text-pink-400 text-2xl animate-pulse">★</span>
        </div>
        <div className="absolute -left-8 top-24 z-10">
          <span className="text-blue-400 text-2xl animate-bounce">🚀</span>
        </div>
        {/* Logo with Floating Animation */}
        <div className="z-20 animate-float">
          <Image
            src="/logo.png"
            alt="Polaris Logo"
            width={180}
            height={180}
            className="rounded-full shadow-2xl border-4 border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-900 mb-4"
          />
        </div>
        <h1 className="z-20 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight drop-shadow-lg mb-2 text-center">
          Welcome to Polaris
        </h1>
        <p className="z-20 text-lg text-gray-700 dark:text-gray-300 text-center max-w-md">
          Build your future with a little AI magic!{" "}
          <span className="inline-block animate-wiggle">🪄</span> <br />
          Sign in or create an account to get started.
        </p>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-16px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(-8deg);
          }
          50% {
            transform: rotate(8deg);
          }
        }
        .animate-wiggle {
          animation: wiggle 1.2s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

      {/* Form Section */}
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 border border-indigo-100 dark:border-gray-800 backdrop-blur-md">
        {view === "login" && (
          <>
            {/* Form Label */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center tracking-tight">
              Sign in
            </h2>

            {/* Helper Text */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
              New to this app?{" "}
              <button
                onClick={() => setView("register")}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Sign up for an account
              </button>
            </p>

            {/* Login Form */}
            <LoginForm
              onLogin={() => router.push("/home")}
              onForgotPassword={() => setView("resetPassword")}
            />
          </>
        )}

        {view === "register" && (
          <>
            {/* Form Label */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center tracking-tight">
              Sign up
            </h2>

            {/* Helper Text */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
              Already have an account?{" "}
              <button
                onClick={() => setView("login")}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Sign in
              </button>
            </p>

            {/* Registration Form */}
            <RegistrationForm onRegister={() => setView("login")} />
          </>
        )}

        {view === "resetPassword" && (
          <>
            {/* Form Label */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center tracking-tight">
              Reset your password
            </h2>

            {/* Reset Password Form */}
            <ResetPasswordForm
              onSuccess={() => setView("login")}
              buttonText="Send reset link"
            />

            {/* Helper Text */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Remembered?{" "}
              <button
                onClick={() => setView("login")}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
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