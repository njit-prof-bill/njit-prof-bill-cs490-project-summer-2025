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
      <div className="w-full max-w-md p-6">
        {showLogin ? (
          <>
            <LoginForm onLogin={() => router.push("/home")} />
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Do not have an account?{" "}
              <button
                onClick={() => setShowLogin(false)}
                className="text-blue-500 hover:underline"
              >
                Register here
              </button>
            </p>
          </>
        ) : (
          <>
            <RegistrationForm onRegister={() => router.push("/home")} />
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => setShowLogin(true)}
                className="text-blue-500 hover:underline"
              >
                Log in here
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}