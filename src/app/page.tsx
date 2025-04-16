"use client";

import { useState } from "react";
import { LoginForm } from "@/components/loginForm";
import { RegistrationForm } from "@/components/registrationForm";

export default function Home() {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-4">
        {isRegistering ? (
          <>
            <RegistrationForm onRegister={() => setIsRegistering(false)} />
            <p className="text-sm text-center text-stone-600 dark:text-stone-400">
              Already have an account?{" "}
              <button
                onClick={() => setIsRegistering(false)}
                className="text-blue-500 hover:underline"
              >
                Sign in here.
              </button>
            </p>
          </>
        ) : (
          <>
            <LoginForm onLogin={() => console.log("Logged in")} />
            <p className="text-sm text-center text-stone-600 dark:text-stone-400">
              Do not have an account?{" "}
              <button
                onClick={() => setIsRegistering(true)}
                className="text-blue-500 hover:underline"
              >
                Register here.
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}