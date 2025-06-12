"use client";

import { getFriendlyFirebaseErrorMessage } from "@/utils/firebaseErrorHandler";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

// Define schema for form validation
const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address").nonempty("Email is required"),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const RATE_LIMIT_DURATION = 60000; // 1 minute in milliseconds
const MAX_ATTEMPTS = 3;

export function ResetPasswordForm({
    onSuccess,
    buttonText = "Reset password",
    inputSpacing = "mb-4",
}: {
    onSuccess: () => void;
    buttonText?: string;
    inputSpacing?: string;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [lastAttemptTime, setLastAttemptTime] = useState<number | null>(null);
    const [cooldownTime, setCooldownTime] = useState<number>(0);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    // Handle cooldown timer
    useEffect(() => {
        if (cooldownTime > 0) {
            const timer = setInterval(() => {
                setCooldownTime((prev) => Math.max(0, prev - 1000));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldownTime]);

    const handlePasswordReset = async (values: ResetPasswordFormValues) => {
        const now = Date.now();

        // Check rate limiting
        if (lastAttemptTime && now - lastAttemptTime < RATE_LIMIT_DURATION) {
            toast.error("Please wait before trying again.");
            return;
        }

        // Check attempt limits
        if (attempts >= MAX_ATTEMPTS) {
            const timeLeft = Math.ceil((RATE_LIMIT_DURATION - (now - lastAttemptTime!)) / 1000);
            setCooldownTime(timeLeft * 1000);
            toast.error(`Too many attempts. Please try again in ${timeLeft} seconds.`);
            return;
        }

        setIsSubmitting(true);
        setLastAttemptTime(now);
        setAttempts((prev) => prev + 1);

        try {
            await sendPasswordResetEmail(auth, values.email);
            toast.success(
                "Password reset email sent. Please check your inbox and follow the instructions to reset your password."
            );
            onSuccess();
        } catch (error: unknown) {
            const errorMessage = getFriendlyFirebaseErrorMessage(error);
            toast.error(errorMessage);
            console.error("Password reset error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handlePasswordReset)}
                className="space-y-4 w-full"
            >
                <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || cooldownTime > 0}
                >
                    {isSubmitting 
                        ? "Sending..." 
                        : cooldownTime > 0 
                            ? `Try again in ${Math.ceil(cooldownTime / 1000)}s` 
                            : buttonText}
                </Button>
            </form>
        </Form>
    );
}