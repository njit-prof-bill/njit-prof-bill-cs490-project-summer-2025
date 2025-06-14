"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { UserNameAddUpdate } from "@/components/userNameAddUpdate";
import Spinner from "@/components/ui/Spinner";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // Redirect unauthenticated users to landing page
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-lg shadow-md rounded-2xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Welcome to Your Profile
          </CardTitle>
        </CardHeader>

        <CardContent className="mt-4">
          <UserNameAddUpdate />
        </CardContent>

        <CardFooter className="text-center text-sm text-muted-foreground">
          You can update your name above.
        </CardFooter>
      </Card>
    </div>
  );
}
