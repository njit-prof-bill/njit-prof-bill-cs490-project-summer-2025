"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"; // Correct import

const errorMessages = {
    'auth/invalid-credential': 'Email and Password do not match our records.',
    'auth/user-not-found': 'No user found with this email.',
    'auth/wrong-password': 'Email and Password do not match our records.',
    'auth/email-already-in-use': 'This email is already in use.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Invalid email address.',
    'An error occurred. Please try again.':
        'Check your email and password and try again.',
}

interface RegistrationFormValues {
    email: string;
    password: string;
    confirmPassword: string;
}

export function RegistrationForm({ onRegister }: { onRegister: () => void }) {
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

    const form = useForm<RegistrationFormValues>({
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const handleRegister = async (values: RegistrationFormValues) => {
        setError(null);

        if (values.password !== values.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // Firebase registration logic
            await createUserWithEmailAndPassword(auth, values.email, values.password);
            console.log("User registered");
            onRegister(); // Notify the parent component
        } catch (err: unknown) {
            if (err instanceof FirebaseError) {
                console.error("Registration failed:", err.message);

                // Extract the key between the last set of parentheses
                const match = err.message.match(/\(([^)]+)\)/); // Matches text inside parentheses
                console.log("Match:", match);
                const errorKey = match ? match[1] : null;

                // Use the extracted key to get the error message or fall back to the original message
                if (errorKey && errorKey in errorMessages) {
                    setError(errorMessages[errorKey as keyof typeof errorMessages]);
                } else {
                    setError(err.message);
                }
            } else {
                console.error("An unexpected error occurred:", err);
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleRegister)}
                className="space-y-4 w-full max-w-md p-6 border border-stone-300 dark:border-stone-700 rounded-lg bg-stone-100 dark:bg-stone-900 shadow-lg"
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
            </form>
        </Form>
    );
}