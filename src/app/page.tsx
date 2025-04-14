"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/loginForm";
import RegistrationForm from "@/components/registrationForm";
import { useAuth } from "@/lib/auth"; // Assuming you have a custom auth hook

const errorMessages: Record<string, string> = {
  "auth/invalid-credential": "Email and Password do not match our records.",
  "auth/user-not-found": "No user found with this email.",
  "auth/wrong-password": "Email and Password do not match our records.",
  "auth/email-already-in-use": "This email is already in use.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "An error occurred. Please try again.":
    "Check your email and password and try again.",
};

export default function LandingPage() {
  const { isAuthenticated, signUp, logIn } = useAuth(); // Custom auth hook
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home"); // Redirect to the home page if authenticated
    }
  }, [isAuthenticated, router]);

  const handleSignUp = async ({ email, password }: { email: string; password: string }) => {
    try {
      await signUp({ email, password });
      setError(""); // Clear error message after successful sign-up
    } catch (error: any) {
      setError(
        errorMessages[error.code] || "An error occurred. Please try again."
      );
    }
  };

  const handleLogIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      await logIn({ email, password });
      setError(""); // Clear error message after successful log-in
    } catch (error: any) {
      setError(
        errorMessages[error.code] || "An error occurred. Please try again."
      );
    }
  };

  const handleSwitchForm = () => {
    setIsSignUp(!isSignUp);
    setError(""); // Clear error message when switching forms
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {isSignUp ? (
        <RegistrationForm
          onSignUp={handleSignUp}
          onSwitchToLogIn={handleSwitchForm}
          error={error}
        />
      ) : (
        <LoginForm
          onLogIn={handleLogIn}
          onSwitchToSignUp={handleSwitchForm}
          error={error}
        />
      )}
    </div>
  );
}