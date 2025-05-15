"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { useTheme } from "@/context/themeContext"; // Import the useTheme hook
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth"; // Import Firebase Auth

export default function SettingsPage() {
    const { theme, setTheme } = useTheme(); // Use the global theme context
    const [name, setName] = useState<string>(""); // State for the user's name
    const [email, setEmail] = useState<string>(""); // State for the user's email
    const [isSaving, setIsSaving] = useState<boolean>(false); // State for saving status
    const [error, setError] = useState<string | null>(null); // State for error messages
    const router = useRouter(); // Initialize router for navigation

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

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        setIsSaving(true);
        setError(null);

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error("No user is currently signed in.");
            }

            // Update the displayName in Firebase
            if (name !== user.displayName) {
                await updateProfile(user, { displayName: name });
                alert("Changes saved successfully!");
            }
        } catch (err: unknown) {
            console.error("Error saving changes:", err);
            if (err instanceof Error) {
                setError(err.message || "Failed to save changes.");
            } else {
                setError("Failed to save changes.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push("/home"); // Navigate back to the home page
    };

    return (
        <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>
                <form className="space-y-6" onSubmit={handleSave}>
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
                            disabled={isSaving} // Disable input while saving
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
                            disabled
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

                    {/* Buttons */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="w-32 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCancel}
                            className="w-32 bg-gray-500 hover:bg-gray-600 text-white"
                        >
                            Cancel
                        </Button>
                    </div>

                    {/* Error Message */}
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </form>
            </div>
        </div>
    );
}