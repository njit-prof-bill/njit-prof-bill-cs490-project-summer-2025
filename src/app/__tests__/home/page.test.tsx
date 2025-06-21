import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/home/page";
import type { MockAuth } from "@/types/auth";

// Mock useRouter
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

// Variable to control useAuth mock
// type MockAuth = { user: { uid: string } | null; loading: boolean };
let mockAuthValue: MockAuth = { user: { uid: "123" }, loading: false };
jest.mock("@/context/authContext", () => ({
    useAuth: () => mockAuthValue,
}));

// Mock Card components (optional, for isolation)
jest.mock("@/components/ui/card", () => ({
    Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
    CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
    CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
    CardFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="card-footer">{children}</div>,
}));

describe("HomePage", () => {
    beforeEach(() => {
        pushMock.mockClear();
        mockAuthValue = { user: { uid: "123" }, loading: false }; // Default: authenticated
    });

    it("renders the main card content when authenticated", () => {
        render(<HomePage />);
        expect(screen.getByTestId("card-title")).toHaveTextContent("Marcus App Template");
        const descriptions = screen.getAllByTestId("card-description");
        expect(descriptions[0]).toHaveTextContent("This app is a starter template for SaaS applications.");
        expect(descriptions[1]).toHaveTextContent("Copyright 2025 Fourier Gauss Labs");
    });

    it("shows loading state if loading is true", () => {
        mockAuthValue = { user: null, loading: true };
        render(<HomePage />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("redirects to landing page if not authenticated", () => {
        mockAuthValue = { user: null, loading: false };
        render(<HomePage />);
        expect(pushMock).toHaveBeenCalledWith("/");
    });
});