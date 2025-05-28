import React from "react";
import { render, screen } from "@testing-library/react";
import RootLayout from "../layout";
import '@testing-library/jest-dom';

// Mock providers and external modules
jest.mock("@/context/authContext", () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));
jest.mock("@/context/themeContext", () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}));
jest.mock("sonner", () => ({
    Toaster: () => <div data-testid="toaster" />,
}));

describe("RootLayout", () => {
    it("renders html, head, and body with children", () => {
        render(
            <RootLayout>
                <div data-testid="child">Hello</div>
            </RootLayout>
        );

        // Check for html and body tags
        expect(document.querySelector("html")).toBeInTheDocument();
        expect(document.querySelector("body")).toBeInTheDocument();

        // Check for meta tags
        expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
            "content",
            "Marcus - A modern SaaS application template"
        );

        // Check for providers and children
        expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
        expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
        expect(screen.getByTestId("toaster")).toBeInTheDocument();
        expect(screen.getByTestId("child")).toHaveTextContent("Hello");
    });
});