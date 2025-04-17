"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginForm } from "@/components/loginForm";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
      <LoginForm onLogin={() => router.push("/home")} />
    </div>
  );
}