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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";

// Define schema for form validation
const loginSchema = z.object({
    email: z.string().email("Invalid email address").nonempty("Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters").nonempty("Password is required"),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const router = useRouter();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log("Google sign-in successful:", user);
            onLogin();
            router.push("/home");
        } catch (err: unknown) {
            toast.error(getFriendlyFirebaseErrorMessage(err));
            console.error("Google sign-in error:", err);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleLogin = async (values: LoginFormValues) => {
        setError(null);
        setIsLoading(true);

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

            // Handle remember me
            if (values.rememberMe) {
                // Set persistence to LOCAL (default is SESSION)
                await auth.setPersistence('local');
            }

            onLogin();
            router.push("/home");
        } catch (err: unknown) {
            setError(getFriendlyFirebaseErrorMessage(err));
        } finally {
            setIsLoading(false);
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

                <div className="flex items-center justify-between">
                    <FormField
                        name="rememberMe"
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
                                    Remember me
                                </FormLabel>
                            </FormItem>
                        )}
                    />

                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Forgot password?
                    </button>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Log In"}
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
                    {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
                </Button>
            </form>
        </Form>
    );
}