"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFriendlyFirebaseErrorMessage } from "@/utils/firebaseErrorHandler";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner"; // Import Sonner's toast function
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Import GoogleAuthProvider
import { FcGoogle } from "react-icons/fc"; // Import Google icon for the button

interface LoginFormValues {
    email: string;
    password: string;
}

export function LoginForm({ onLogin }: { onLogin: () => void }) {
    const [error, setError] = useState<string | null>(null);
    const [showResendLink, setShowResendLink] = useState(false); // State to show resend link
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const router = useRouter(); // Initialize router

    const form = useForm<LoginFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider(); // Initialize GoogleAuthProvider
            const result = await signInWithPopup(auth, provider); // Sign in with Google popup
            const user = result.user;

            console.log("Google sign-in successful:", user);
            onLogin(); // Notify the parent component
            router.push("/home"); // Redirect to the home page
        } catch (err: unknown) {
            toast.error("Failed to sign in with Google. Please try again.");
            console.error("Google sign-in error:", err);
        }
    };

    const handleLogin = async (values: LoginFormValues) => {
        setError(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // Check if the user's email is verified
            if (!user.emailVerified) {
                setError("Your email is not verified.");
                setShowResendLink(true); // Show the resend link
                return; // Prevent redirection
            }

            console.log("User logged in");
            onLogin(); // Notify the parent component
            router.push("/home"); // Redirect to the home page
        } catch (err: unknown) {
            setError(getFriendlyFirebaseErrorMessage(err));
        }
    };

    const handleResendVerification = async () => {
        try {
            // Reauthenticate the user
            const values = form.getValues(); // Get the email and password from the form
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // Send the verification email
            await sendEmailVerification(user);
            toast.success("Verification email resent. Please check your inbox.");
            setShowResendLink(false); // Hide the resend link
        } catch (err: unknown) {
            toast.error("Failed to resend verification email. Please try again.");
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleLogin)}
                className="space-y-4 w-full max-w-md p-6 border border-stone-300 dark:border-stone-700 rounded-lg bg-stone-100 dark:bg-stone-900 shadow-lg"
            >
                {error && <p className="text-sm text-red-500">{error}</p>} {/* Display error message */}
                {showResendLink && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your email is not verified.{" "}
                        <button
                            type="button"
                            onClick={handleResendVerification}
                            className="text-blue-500 hover:underline"
                        >
                            Click here to resend the verification email.
                        </button>
                    </p>
                )}

                <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    id="email"
                                    placeholder="Enter your email"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                                    >
                                        {showPassword ? (
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

                <Button type="submit" className="w-full">
                    Log In
                </Button>

                {/* Divider with "or" */}
                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="mx-2 text-sm text-gray-500 dark:text-gray-400">or</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                {/* Google Sign-In Button */}
                <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                    <FcGoogle className="h-5 w-5" /> {/* Google Icon */}
                    Sign in with Google
                </Button>
            </form>
        </Form>
    );
}