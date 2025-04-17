"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFriendlyFirebaseErrorMessage } from "@/utils/firebaseErrorHandler";
import { useRouter } from "next/navigation"; // Import useRouter

interface LoginFormValues {
    email: string;
    password: string;
}

export function LoginForm({ onLogin }: { onLogin: () => void }) {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // Initialize router

    const form = useForm<LoginFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleLogin = async (values: LoginFormValues) => {
        setError(null);

        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            console.log("User logged in");
            onLogin(); // Notify the parent component
            router.push("/home"); // Redirect to the home page
        } catch (err: unknown) {
            setError(getFriendlyFirebaseErrorMessage(err));
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