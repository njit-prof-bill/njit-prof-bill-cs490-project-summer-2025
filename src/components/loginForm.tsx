"use client";

import { useState } from "react";

export default function LoginForm({
    onLogIn,
    onSwitchToSignUp,
    error,
}: {
    onLogIn: ({ email, password }: { email: string; password: string }) => void;
    onSwitchToSignUp: () => void;
    error: string;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogIn({ email, password });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-gray-800 rounded-lg shadow-lg p-6 space-y-6"
            >
                <h2 className="text-center text-2xl font-bold text-white">Log In</h2>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full rounded-md bg-blue-600 p-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Log In
                </button>
                <p className="text-center text-sm text-gray-400">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToSignUp}
                        className="text-blue-500 hover:underline"
                    >
                        Sign Up
                    </button>
                </p>
            </form>
        </div>
    );
}