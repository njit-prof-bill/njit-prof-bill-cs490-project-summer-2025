"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app"; // Import FirebaseError type

interface LoginFormValues {
    email: string;
    password: string;
}

export function LoginForm({ onLogin }: { onLogin: () => void }) {
    const [error, setError] = useState<string | null>(null);

    // Initialize react-hook-form
    const form = useForm<LoginFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleLogin = async (values: LoginFormValues) => {
        setError(null); // Clear any previous errors

        try {
            // Firebase authentication logic
            await signInWithEmailAndPassword(auth, values.email, values.password);
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
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleLogin)}
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
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    Log In
                </Button>
            </form>
        </Form>
    );
}