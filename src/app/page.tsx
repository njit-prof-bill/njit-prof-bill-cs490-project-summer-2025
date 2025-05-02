"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/forms/loginForm";
import { RegistrationForm } from "@/components/forms/registrationForm";
import { ResetPasswordForm } from "@/components/forms/resetPasswordForm";

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
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md px-6">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-left">
              Reset your password
            </h1>

            {/* Reset Password Form */}
            <ResetPasswordForm
              onSuccess={() => setView("login")}
              buttonText="Send reset link" // Updated button text
              inputSpacing="mb-6" // Added spacing between input and button
            />

            {/* Helper Text */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-left">
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