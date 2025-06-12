"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { Input } from "@/components/ui/input";
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
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; // Ensure getDoc is imported
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { getFriendlyFirebaseErrorMessage } from "@/utils/firebaseErrorHandler";

type ThemeType = "light" | "dark" | "system";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme(); // Use the global theme context
    const [name, setName] = useState<string>(""); // State for the user's name
    const [email, setEmail] = useState<string>(""); // State for the user's email
    const [careerObjective, setCareerObjective] = useState<string>(""); // State for career objective // ADDED
    const [isSaving, setIsSaving] = useState<boolean>(false); // State for saving status
    const [error, setError] = useState<string | null>(null); // State for error messages
    const router = useRouter(); // Initialize router for navigation
    const [isOAuthUser, setIsOAuthUser] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const auth = getAuth();

        // Define an async function to handle user data fetching
        const fetchUserData = async (user: any) => {
            if (user) {
                setName(user.displayName || "");
                setEmail(user.email || "");

                // Fetch careerObjective from Firestore
                const db = getFirestore();
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCareerObjective(data.careerObjective || "");
                } else {
                    setCareerObjective("");
                }

                // Existing OAuth check
                const isOAuth = user.providerData.some(
                    (provider: any) => provider.providerId !== "password"
                );
                setIsOAuthUser(isOAuth);
            }
        };

        // Subscribe to auth state changes using the async function
        const unsubscribe = onAuthStateChanged(auth, fetchUserData);

        // Cleanup the listener on unmount
        return () => unsubscribe();
    }, []); // No change here, dependency array is empty as it listens to auth state changes

    const form = useForm({
        defaultValues: {
            name: name,
            email: email,
            theme: theme,
            careerObjective: careerObjective, // ADDED
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (name && email && theme) {
            form.reset({
                name,
                email,
                theme,
                careerObjective, // ADDED
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [name, email, theme, careerObjective, form]); // ADDED careerObjective to dependency array

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const values = form.getValues();

            if (!user) {
                throw new Error("No user is currently signed in.");
            }

            // Update the displayName in Firebase
            if (values.name !== user.displayName) {
                await updateProfile(user, { displayName: values.name });
            }

            // Save theme and careerObjective to Firestore
            const db = getFirestore();
            const userRef = doc(db, "users", user.uid);
            await setDoc(
                userRef,
                {
                    theme: values.theme,
                    careerObjective: values.careerObjective || "", // MODIFIED: Save careerObjective
                },
                { merge: true }
            );

            // Change password if not OAuth and fields are filled
            if (
                !isOAuthUser &&
                values.currentPassword &&
                values.newPassword &&
                values.confirmPassword
            ) {
                if (values.newPassword !== values.confirmPassword) {
                    throw new Error("New password and confirmation do not match.");
                }
                // Re-authenticate
                const credential = EmailAuthProvider.credential(
                    user.email!,
                    values.currentPassword
                );
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, values.newPassword);
                toast.success("Password changed successfully.");
            }

            toast.success("Profile settings saved.");

            // Clear password fields after successful save
            form.reset({
                name: values.name,
                email: values.email,
                theme: values.theme,
                careerObjective: values.careerObjective, // MODIFIED: Clear careerObjective after save
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

        } catch (err: unknown) {
            console.error("Error saving changes:", err);
            setError(getFriendlyFirebaseErrorMessage(err));
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
                <Form {...form}>
                    <form className="space-y-6" onSubmit={handleSave}>
                        {/* Name Field */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your name"
                                            disabled={isSaving}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your email"
                                            disabled
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Career Objective / Summary Field - ADDED */}
                        <FormField
                            control={form.control}
                            name="careerObjective"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Career Objective / Summary</FormLabel>
                                    <FormControl>
                                        <textarea // Use textarea for multi-line input
                                            {...field}
                                            placeholder="Write your career objective or summary here"
                                            className="w-full p-2 border rounded" // Basic Tailwind styling
                                            disabled={isSaving}
                                            rows={4} // Set the number of visible rows
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Theme Field */}
                        <FormField
                            control={form.control}
                            name="theme"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Theme</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setTheme(value as ThemeType);
                                            }}
                                            value={field.value}
                                            disabled={isSaving}
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
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password Fields */}
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showCurrentPassword ? "text" : "password"}
                                                placeholder="Enter your current password"
                                                disabled={isOAuthUser}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword((v) => !v)}
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                                                tabIndex={-1}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="Enter your new password"
                                                disabled={isOAuthUser}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword((v) => !v)}
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                                                tabIndex={-1}
                                            >
                                                {showNewPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                disabled={isOAuthUser}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                </Form>
            </div>
        </div>
    );
}
