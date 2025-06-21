import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "@/components/forms/loginForm";

// Mock dependencies
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/components/ui/input", () => ({
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));
jest.mock("@/components/ui/button", () => ({
    Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => <button {...props}>{props.children}</button>,
}));

jest.mock("@/components/ui/form", () => ({
    Form: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    FormField: ({ render, ...props }: { render: (args: any) => React.ReactNode }) => <>{render({ field: {} })}</>,
    FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
    FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    FormMessage: () => <div data-testid="form-message" />,
}));

jest.mock("@heroicons/react/24/outline", () => ({
    EyeIcon: () => <svg data-testid="eye-icon" />,
    EyeSlashIcon: () => <svg data-testid="eye-slash-icon" />,
}));

jest.mock("sonner", () => ({
    toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("react-icons/fc", () => ({
    FcGoogle: () => <svg data-testid="google-icon" />,
}));

// Firebase mocks

// eslint-disable-next-line no-var
var signInWithEmailAndPasswordMock = jest.fn();
// eslint-disable-next-line no-var
var sendEmailVerificationMock = jest.fn();
// eslint-disable-next-line no-var
var signInWithPopupMock = jest.fn();
// eslint-disable-next-line no-var
var GoogleAuthProviderMock = jest.fn(() => ({})); // <-- ensure it's a constructor

jest.mock("firebase/auth", () => ({
    signInWithEmailAndPassword: (...args: unknown[]) => signInWithEmailAndPasswordMock(...args),
    sendEmailVerification: (...args: unknown[]) => sendEmailVerificationMock(...args),
    signInWithPopup: (...args: unknown[]) => signInWithPopupMock(...args),
    GoogleAuthProvider: GoogleAuthProviderMock,
}));

jest.mock("@/lib/firebase", () => ({
    auth: {},
}));

jest.mock("@/utils/firebaseErrorHandler", () => ({
    getFriendlyFirebaseErrorMessage: () => "Friendly error",
}));

describe("LoginForm", () => {
    let onLogin: jest.Mock;
    let onForgotPassword: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        onLogin = jest.fn();
        onForgotPassword = jest.fn();
    });

    it("renders email and password fields, login and Google buttons", () => {
        render(<LoginForm onLogin={onLogin} onForgotPassword={onForgotPassword} />);
        expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
        expect(screen.getByText("Log In")).toBeInTheDocument();
        expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
    });

    it("calls onForgotPassword when the link is clicked", () => {
        render(<LoginForm onLogin={onLogin} onForgotPassword={onForgotPassword} />);
        fireEvent.click(screen.getByText("Forgot password?"));
        expect(onForgotPassword).toHaveBeenCalled();
    });

    it("shows error if login fails", async () => {
        signInWithEmailAndPasswordMock.mockRejectedValueOnce(new Error("fail"));
        render(<LoginForm onLogin={onLogin} onForgotPassword={onForgotPassword} />);
        fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "password" } });
        fireEvent.click(screen.getByText("Log In"));
        await waitFor(() => expect(screen.getByText("Friendly error")).toBeInTheDocument());
    });

    it("calls onLogin and router.push on successful login with verified email", async () => {
        signInWithEmailAndPasswordMock.mockResolvedValueOnce({
            user: { emailVerified: true, reload: jest.fn() },
        });
        render(<LoginForm onLogin={onLogin} onForgotPassword={onForgotPassword} />);
        fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "password" } });
        fireEvent.click(screen.getByText("Log In"));
        await waitFor(() => expect(onLogin).toHaveBeenCalled());
    });

    it("shows resend verification link if email is not verified", async () => {
        signInWithEmailAndPasswordMock.mockResolvedValueOnce({
            user: { emailVerified: false, reload: jest.fn() },
        });
        render(<LoginForm onLogin={onLogin} onForgotPassword={onForgotPassword} />);
        fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "password" } });
        fireEvent.click(screen.getByText("Log In"));
        await waitFor(() => {
            const warnings = screen.getAllByText("Your email is not verified.");
            expect(warnings.length).toBeGreaterThan(1); // or use .toBe(2) if you expect exactly 2
        });
        expect(screen.getByText("Click here to resend the verification email.")).toBeInTheDocument();
    });

    // it("handles Google sign-in", async () => {
    //     signInWithPopupMock.mockResolvedValueOnce({ user: {} });
    //     render(<LoginForm onLogin={onLogin} onForgotPassword={onForgotPassword} />);

    //     fireEvent.click(screen.getByText(/sign in with google/i));

    //     // Wait for both the Firebase call and the onLogin callback
    //     await waitFor(() => {
    //         expect(signInWithPopupMock).toHaveBeenCalled();
    //         expect(onLogin).toHaveBeenCalled();
    //     });
    // });
});