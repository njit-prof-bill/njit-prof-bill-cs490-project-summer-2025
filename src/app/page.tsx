"use client";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/firebase";

export default function Home() {
  useEffect(() => {
    console.log(auth); // Log the auth object when the component is rendered
  }, []);

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
        </CardContent>
      </Card>
    </div>
  );
}