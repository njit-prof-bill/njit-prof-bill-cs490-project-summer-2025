"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFriendlyFirebaseErrorMessage } from "@/utils/firebaseErrorHandler";
import { useRouter } from "next/navigation"; // Import useRouter

interface RegistrationFormValues {
    email: string;
    password: string;
    confirmPassword: string;
}

export function RegistrationForm({ onRegister }: { onRegister: () => void }) {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // Initialize router

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
            await createUserWithEmailAndPassword(auth, values.email, values.password);
            console.log("User registered");
            onRegister(); // Notify the parent component
            router.push("/home"); // Redirect to the home page
        } catch (err: unknown) {
            setError(getFriendlyFirebaseErrorMessage(err));
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

                <FormField
                    name="confirmPassword"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    {...field}
                                />
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