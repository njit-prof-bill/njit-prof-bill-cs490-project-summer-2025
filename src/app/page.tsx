"use client";

import { Button } from "@/components/ui/button"; // Example Shadcn component
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import app from "@/lib/firebaseConfig"; // Adjust the import path if needed
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<null | string>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const auth = getAuth(app);
    await signInAnonymously(auth);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">Next.js Setup Test</h1>
      <p className="mt-4 text-lg text-gray-700">
        {user ? `Signed in as: ${user}` : "Not signed in"}
      </p>
      <Button className="mt-6" onClick={handleSignIn}>
        {user ? "Signed In" : "Sign In Anonymously"}
      </Button>
    </div>
  );
}
