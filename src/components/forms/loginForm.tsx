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

interface LoginFormValues {
    email: string;
    password: string;
}

export function LoginForm({ onLogin }: { onLogin: () => void }) {
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
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
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // Check if the user's email is verified
            if (!user.emailVerified) {
                setError("Verify your account by clicking the link we emailed you.");
                await sendEmailVerification(user); // Resend verification email
                toast.success("Verification email resent. Please check your inbox.");
                return; // Prevent redirection
            }

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
                {error && <p className="text-sm text-red-500">{error}</p>} {/* Display error message */}

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
            </form>
        </Form>
    );
}