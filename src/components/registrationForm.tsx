"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegistrationForm({
    onSignUp,
    onSwitchToLogIn,
    error,
}: {
    onSignUp: ({ email, password }: { email: string; password: string }) => void;
    onSwitchToLogIn: () => void;
    error: string;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSignUp({ email, password });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            <h1 className="text-2xl font-bold text-center">Sign Up</h1>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" className="w-full">
                Sign Up
            </Button>
            <p className="text-sm text-center">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitchToLogIn}
                    className="text-blue-500 underline"
                >
                    Log In
                </button>
            </p>
        </form>
    );
}