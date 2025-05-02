"use client";

import { ResetPasswordForm } from "@/components/forms/resetPasswordForm";

export default function TestResetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <ResetPasswordForm onSuccess={() => alert("Password reset email sent successfully!")} />
        </div>
    );
}