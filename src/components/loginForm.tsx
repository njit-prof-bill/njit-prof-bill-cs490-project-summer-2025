"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app"; // Import FirebaseError type

export function LoginForm({ onLogin }: { onLogin: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear any previous errors

        try {
            // Firebase authentication logic
            await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in");
            onLogin(); // Notify the parent component
        } catch (err: unknown) {
            if (err instanceof FirebaseError) {
                console.error("Login failed:", err.message);
                setError("Invalid email or password. Please try again.");
            } else {
                console.error("An unexpected error occurred:", err);
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
                <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Log In
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}