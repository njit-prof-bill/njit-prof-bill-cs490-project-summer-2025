"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "@/components/loginForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    console.log("User logged out");
  };

  if (user) {
    // Render the home page when the user is authenticated
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Marcus App Template</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              This app is a starter template for SaaS applications. To use this template, simply fork the repository and install the app dependencies.
            </CardDescription>
            <Button onClick={handleLogout} className="mt-4">
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the login form when the user is not authenticated
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginForm onLogin={() => setUser(auth.currentUser)} />
    </div>
  );
}