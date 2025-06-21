import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LandingPage from "../page";
import type { MockAuth } from "@/types/auth";

// Mock next/image to avoid Next.js SSR issues
jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

// Mock useRouter
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

// Variable to control useAuth mock
let mockAuthValue: MockAuth = { user: null, loading: false };
jest.mock("@/context/authContext", () => ({
    useAuth: () => mockAuthValue,
}));

// Explicit prop types for mocked forms
type LoginFormProps = {
    onLogin: () => void;
    onForgotPassword: () => void;
};
type RegistrationFormProps = {
    onRegister: () => void;
};
type ResetPasswordFormProps = {
    onSuccess: () => void;
};

// Mock form components
jest.mock("@/components/forms/loginForm", () => ({
    LoginForm: ({ onLogin, onForgotPassword }: LoginFormProps) => (
        <div>
            <button onClick={onLogin}>Login</button>
            <button onClick={onForgotPassword}>Forgot Password</button>
        </div>
    ),
}));
jest.mock("@/components/forms/registrationForm", () => ({
    RegistrationForm: ({ onRegister }: RegistrationFormProps) => (
        <div>
            <button onClick={onRegister}>Register</button>
        </div>
    ),
}));
jest.mock("@/components/forms/resetPasswordForm", () => ({
    ResetPasswordForm: ({ onSuccess }: ResetPasswordFormProps) => (
        <div>
            <button onClick={onSuccess}>Reset Password</button>
        </div>
    ),
}));

describe("LandingPage", () => {
    beforeEach(() => {
        pushMock.mockClear();
        mockAuthValue = { user: null, loading: false }; // Reset to default before each test
    });

    it("shows login form by default", () => {
        render(<LandingPage />);
        expect(screen.getByText("Sign in")).toBeInTheDocument();
        expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("switches to registration form", () => {
        render(<LandingPage />);
        fireEvent.click(screen.getByText("Sign up for an account"));
        expect(screen.getByText("Sign up")).toBeInTheDocument();
        expect(screen.getByText("Register")).toBeInTheDocument();
    });

    it("switches to reset password form", () => {
        render(<LandingPage />);
        fireEvent.click(screen.getByText("Forgot Password"));
        expect(screen.getByText("Reset your password")).toBeInTheDocument();
        expect(screen.getByText("Reset Password")).toBeInTheDocument();
    });

    it("returns to login from registration", () => {
        render(<LandingPage />);
        fireEvent.click(screen.getByText("Sign up for an account"));
        fireEvent.click(screen.getByText("Sign in"));
        expect(screen.getByText("Sign in")).toBeInTheDocument();
    });

    it("returns to login from reset password", () => {
        render(<LandingPage />);
        fireEvent.click(screen.getByText("Forgot Password"));
        fireEvent.click(screen.getByText("Go back to sign in"));
        expect(screen.getByText("Sign in")).toBeInTheDocument();
    });

    it("redirects to /home if user is authenticated", () => {
        mockAuthValue = { user: { uid: "123" }, loading: false };
        render(<LandingPage />);
        expect(pushMock).toHaveBeenCalledWith("/home");
    });

    it("shows loading state if loading is true", () => {
        mockAuthValue = { user: null, loading: true };
        render(<LandingPage />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
});