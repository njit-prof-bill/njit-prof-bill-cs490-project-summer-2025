"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/forms/loginForm";
import { RegistrationForm } from "@/components/forms/registrationForm";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(true); // State to toggle between forms

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
      <div className="w-full max-w-md px-6"> {/* Shared container with consistent padding */}
        {showLogin ? (
          <>
            {/* Form Label */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Sign in
            </h1>

            {/* Helper Text */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              New to this app?{" "}
              <button
                onClick={() => setShowLogin(false)}
                className="text-blue-500 hover:underline"
              >
                Sign up for an account
              </button>
            </p>

            {/* Login Form */}
            <LoginForm onLogin={() => router.push("/home")} />
          </>
        ) : (
          <>
            {/* Form Label */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Sign up
            </h1>

            {/* Helper Text */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Already have an account?{" "}
              <button
                onClick={() => setShowLogin(true)}
                className="text-blue-500 hover:underline"
              >
                Sign in
              </button>
            </p>

            {/* Registration Form */}
            <RegistrationForm onRegister={() => setShowLogin(true)} />
          </>
        )}
      </div>
    </div>
  );
}