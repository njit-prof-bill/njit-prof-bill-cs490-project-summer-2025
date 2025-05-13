"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { useTheme } from "@/context/themeContext"; // Import the useTheme hook
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Auth

export default function SettingsPage() {
    const { theme, setTheme } = useTheme(); // Use the global theme context
    const [name, setName] = useState<string>(""); // State for the user's name
    const [email, setEmail] = useState<string>(""); // State for the user's email

    useEffect(() => {
        const auth = getAuth(); // Initialize Firebase Auth
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Populate the name and email fields if the user is signed in
                setName(user.displayName || ""); // Use displayName or an empty string
                setEmail(user.email || ""); // Use email or an empty string
            }
        });

        // Cleanup the listener on unmount
        return () => unsubscribe();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>
                <form className="space-y-6">
                    {/* Name Field */}
                    <div>
                        <Label htmlFor="name" className="mb-2 block">
                            Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)} // Allow editing
                            placeholder="Enter your name"
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <Label htmlFor="email" className="mb-2 block">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} // Allow editing
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* Theme Field */}
                    <div>
                        <Label htmlFor="theme" className="mb-2 block">
                            Theme
                        </Label>
                        <Select
                            onValueChange={(value) => setTheme(value as "system" | "light" | "dark")}
                            value={theme}
                        >
                            <SelectTrigger id="theme">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Password Fields */}
                    <div>
                        <Label htmlFor="current-password" className="mb-2 block">
                            Current Password
                        </Label>
                        <Input
                            id="current-password"
                            type="password"
                            placeholder="Enter your current password"
                        />
                    </div>
                    <div>
                        <Label htmlFor="new-password" className="mb-2 block">
                            New Password
                        </Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="Enter your new password"
                        />
                    </div>
                    <div>
                        <Label htmlFor="confirm-password" className="mb-2 block">
                            Confirm Password
                        </Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm your new password"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}