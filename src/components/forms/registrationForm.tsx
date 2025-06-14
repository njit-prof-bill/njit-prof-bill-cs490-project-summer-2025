"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; // Make sure to export db from your firebase config
import { getFriendlyFirebaseErrorMessage } from "@/utils/firebaseErrorHandler";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

interface RegistrationFormValues {
    email: string;
    password: string;
    confirmPassword: string;
}

export function RegistrationForm({ onRegister }: { onRegister: () => void }) {
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<RegistrationFormValues>({
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    // Function to store user data in Firestore
    const storeUserInFirestore = async (user: any, authMethod: 'email' | 'google') => {
        try {
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                uid: user.uid,
                authMethod: authMethod,
                emailVerified: user.emailVerified,
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
            });
            console.log("User data stored in Firestore successfully");
        } catch (error) {
            console.error("Error storing user data in Firestore:", error);
            // Don't throw error here as the user is already created in Auth
            toast.error("Account created but there was an issue storing user data. Please contact support if you experience issues.");
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Store user data in Firestore
            await storeUserInFirestore(user, 'google');

            console.log("Google sign-in successful:", user);
            toast.success("Successfully signed in with Google!");
            onRegister();
        } catch (err: unknown) {
            toast.error("Failed to sign in with Google. Please try again.");
            console.error("Google sign-in error:", err);
        }
    };

    const handleRegister = async (values: RegistrationFormValues) => {
        setError(null);

        if (values.password !== values.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // Store user data in Firestore
            await storeUserInFirestore(user, 'email');

            // Send email verification
            await sendEmailVerification(user);

            // Show toast notification
            toast.success("Account created successfully! Verification email sent - please check your inbox and verify your email before logging in.");

            onRegister(); // Notify the parent component to switch to the login form
        } catch (err: unknown) {
            setError(getFriendlyFirebaseErrorMessage(err));
            console.error("Registration error:", err);
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleRegister)}
                className="space-y-4 w-full"
            >
                {error && <p className="text-sm text-red-500">{error}</p>}

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

                <FormField
                    name="confirmPassword"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
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

                <Button type="submit" className="w-full">
                    Register
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
                    className="w-full flex items-center justify-center gap-2 dark:bg-black dark:text-stone-300 dark:border-stone-600 border-1 bg-white text-black border-black"
                >
                    <FcGoogle className="h-5 w-5" />
                    Continue with Google
                </Button>
            </form>
        </Form>
    );
}