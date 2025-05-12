"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

export default function SettingsPage() {
    const [theme, setTheme] = useState("system"); // Default to "system"

    // Apply the theme dynamically
    useEffect(() => {
        const root = window.document.documentElement;

        if (theme === "light") {
            root.classList.remove("dark");
        } else if (theme === "dark") {
            root.classList.add("dark");
        } else {
            // System theme
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (prefersDark) {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        }
    }, [theme]);

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
                        <Input id="name" type="text" placeholder="Enter your name" />
                    </div>

                    {/* Email Field */}
                    <div>
                        <Label htmlFor="email" className="mb-2 block">
                            Email
                        </Label>
                        <Input id="email" type="email" placeholder="Enter your email" />
                    </div>

                    {/* Theme Field */}
                    <div>
                        <Label htmlFor="theme" className="mb-2 block">
                            Theme
                        </Label>
                        <Select onValueChange={(value) => setTheme(value)}>
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