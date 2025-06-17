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
import { toast } from "sonner";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

interface LoginFormValues {
    email: string;
    password: string;
}

export function LoginForm({
    onLogin,
    onForgotPassword,
}: {
    onLogin: () => void;
    onForgotPassword: () => void;
}) {
    const [error, setError] = useState<string | null>(null);
    const [showResendLink, setShowResendLink] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const form = useForm<LoginFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log("Google sign-in successful:", user);
            onLogin();
            router.push("/home");
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

            // Force refresh the user's emailVerified status
            await user.reload();

            if (!user.emailVerified) {
                setError("Your email is not verified.");
                setShowResendLink(true);
                return;
            }

            onLogin();
            router.push("/home");
        } catch (err: unknown) {
            setError(getFriendlyFirebaseErrorMessage(err));
        }
    };

    const handleResendVerification = async () => {
        try {
            const values = form.getValues();
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            await sendEmailVerification(user);
            toast.success("Verification email resent. Please check your inbox.");
            setShowResendLink(false);
        } catch (err: unknown) {
            toast.error("Failed to resend verification email. Please try again.");
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleLogin)}
                className="space-y-4 w-full"
            >
                {error && <p className="text-sm text-red-500">{error}</p>}
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

                {/* Forgot Password Link */}
                <div className="mt-2 text-left">
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Forgot password?
                    </button>
                </div>

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
                    className="w-full flex items-center justify-center gap-2 dark:bg-black dark:text-stone-300 dark:border-stone-600 border-1 bg- text-black border-black"
                >
                    <FcGoogle className="h-5 w-5" />
                    Sign in with Google
                </Button>
            </form>
        </Form>
    );
}