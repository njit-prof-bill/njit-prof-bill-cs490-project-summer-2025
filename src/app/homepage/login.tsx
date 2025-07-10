"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginForm } from "@/components/forms/loginForm";
import { XIcon } from "lucide-react";

interface LoginProps {
  onClose: () => void;
}

export default function Login({ onClose }: LoginProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/homepage");
    }
  }, [user, loading, router]);

  if (loading) {
    return null;
  }

  return (
    <div className="absolute right-4 top-16 z-50">
      <div className="login-popover bg-white border border-gray-200 rounded-lg shadow-lg w-80 p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-4">Sign In</h1>

        {/* NO onForgotPassword */}
        <LoginForm
          onLogin={() => router.push("/homepage")}
        />

        <p className="text-sm text-gray-600 mt-4 text-center">
          Need help or want to create an account?{" "}
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/homepage");
            }}
            className="text-blue-500 hover:underline"
          >
            More options
          </button>
        </p>
      </div>
    </div>
  );
}
