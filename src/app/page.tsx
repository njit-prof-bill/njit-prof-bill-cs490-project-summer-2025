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
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6">
      {/* Branding Section */}
      <div className="absolute top-64 w-full">
        <div className="flex items-center justify-center">
          <hr className="w-4/5 border-gray-300 dark:border-gray-600" />
          <div className="absolute -top-6 px-4">
            <div className="flex items-center space-x-2 bg-transparent">
              <Image
                src="/logo.png"
                alt="Marcus Logo"
                width={40}
                height={40}
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Marcus
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md mt-32">
        {view === "login" && (
          <>
            {/* Form Label */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Sign in
            </h1>

            {/* Helper Text */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              New to this app?{" "}
              <button
                onClick={() => setView("register")}
                className="text-blue-500 hover:underline"
              >
                Sign up for an account
              </button>
            </p>

            {/* Login Form */}
            <LoginForm
              onLogin={() => router.push("/home")}
              onForgotPassword={() => setView("resetPassword")} // Switch to reset password view
            />
          </>
        )}

        {view === "register" && (
          <>
            {/* Form Label */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Sign up
            </h1>

            {/* Helper Text */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Already have an account?{" "}
              <button
                onClick={() => setView("login")}
                className="text-blue-500 hover:underline"
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Reset your password
            </h1>

            {/* Reset Password Form */}
            <ResetPasswordForm
              onSuccess={() => setView("login")}
              buttonText="Send reset link"
            />

            {/* Helper Text */}
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