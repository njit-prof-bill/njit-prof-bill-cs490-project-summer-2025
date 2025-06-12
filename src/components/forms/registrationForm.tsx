"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFriendlyFirebaseErrorMessage } from "@/utils/firebaseErrorHandler";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";

// Define schema for form validation
const registrationSchema = z.object({
    email: z.string().email("Invalid email address").nonempty("Email is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().nonempty("Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function RegistrationForm({ onRegister }: { onRegister: () => void }) {
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        },
    });

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log("Google sign-in successful:", user);
            onRegister();
        } catch (err: unknown) {
            toast.error(getFriendlyFirebaseErrorMessage(err));
            console.error("Google sign-in error:", err);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleRegister = async (values: RegistrationFormValues) => {
        setError(null);
        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // Send email verification
            await sendEmailVerification(user);

            // Show toast notification
            toast.success("Verification email sent! Please check your inbox and verify your email before logging in.");

            onRegister();
        } catch (err: unknown) {
            setError(getFriendlyFirebaseErrorMessage(err));
        } finally {
            setIsLoading(false);
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

                <FormField
                    name="acceptTerms"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                                I accept the{" "}
                                <a
                                    href="/terms"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    terms and conditions
                                </a>
                            </FormLabel>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Register"}
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
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-2 dark:bg-black dark:text-stone-300 dark:border-stone-600 border-1 bg-white text-black border-black"
                >
                    <FcGoogle className="h-5 w-5" />
                    {isGoogleLoading ? "Signing up..." : "Continue with Google"}
                </Button>
            </form>
        </Form>
    );
}