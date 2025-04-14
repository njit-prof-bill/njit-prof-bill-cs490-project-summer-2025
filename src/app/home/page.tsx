"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
    const { logOut } = useAuth(); // Access the logOut function from the useAuth hook
    const router = useRouter();

    const handleLogOut = async () => {
        try {
            await logOut(); // Log the user out
            router.push("/"); // Redirect to the landing page
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome to the Home Page!</h1>
                <button
                    onClick={handleLogOut}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
}