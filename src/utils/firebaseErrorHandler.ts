import { FirebaseError } from "firebase/app";

const errorMessages = {
    'auth/invalid-credential': 'Email and Password do not match our records.',
    'auth/user-not-found': 'No user found with this email.',
    'auth/wrong-password': 'Email and Password do not match our records.',
    'auth/email-already-in-use': 'This email is already in use.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Invalid email address.',
    'An error occurred. Please try again.': 'Check your email and password and try again.',
};

export function getFriendlyFirebaseErrorMessage(err: unknown): string {
    if (err instanceof FirebaseError) {
        // Extract the key between parentheses
        const match = err.message.match(/\(([^)]+)\)/); // Matches text inside parentheses
        const errorKey = match ? match[1] : null;

        // Return the friendly error message or fallback to the original message
        if (errorKey && errorKey in errorMessages) {
            return errorMessages[errorKey as keyof typeof errorMessages];
        }
        return err.message;
    }

    // Fallback for non-Firebase errors
    return "An unexpected error occurred. Please try again.";
}