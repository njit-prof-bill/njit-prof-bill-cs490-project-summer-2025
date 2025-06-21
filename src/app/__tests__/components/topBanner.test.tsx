/* eslint-disable @next/next/no-img-element */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TopBanner from "@/components/topBanner";
import { signOut } from "firebase/auth";


// Mock dependencies
jest.mock("@heroicons/react/24/outline", () => ({
    Bars3Icon: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="bars-icon" {...props} />,
}));

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={props.alt} {...props} />,
}));

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
    usePathname: () => "/home",
}));

jest.mock("firebase/auth", () => ({
    signOut: jest.fn(() => Promise.resolve()),
}));

// Mock auth.currentUser
jest.mock("@/lib/firebase", () => ({
    auth: {
        currentUser: {
            displayName: "Jane Doe",
        },
    },
}));

// At the top of your test file
let mockDisplayName = "Jane Doe";
jest.mock("@/lib/firebase", () => ({
    auth: {
        get currentUser() {
            return { displayName: mockDisplayName };
        },
    },
}));

// Mock UI components
jest.mock("@/components/ui/avatar", () => ({
    Avatar: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar">{children}</div>,
    AvatarImage: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img data-testid="avatar-image" {...props} alt="" />,
    AvatarFallback: ({ children }: { children: React.ReactNode }) => <span data-testid="avatar-fallback">{children}</span>,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
        <div data-testid="dropdown-item" onClick={onClick}>{children}</div>
    ),
}));

describe("TopBanner", () => {
    it("renders logo, page title, and avatar", () => {
        render(<TopBanner toggleSidePanel={jest.fn()} />);
        expect(screen.getByAltText("Marcus Home")).toBeInTheDocument();
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Marcus")).toBeInTheDocument();
        expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("jd");
    });

    it("calls toggleSidePanel when hamburger is clicked", () => {
        const toggleMock = jest.fn();
        render(<TopBanner toggleSidePanel={toggleMock} />);
        fireEvent.click(screen.getByTestId("bars-icon"));
        expect(toggleMock).toHaveBeenCalled();
    });

    it("shows correct initials for single name", () => {
        mockDisplayName = "Alice";
        render(<TopBanner toggleSidePanel={jest.fn()} />);
        expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("a");
    });

    it("navigates to settings when Settings is clicked", () => {
        render(<TopBanner toggleSidePanel={jest.fn()} />);
        fireEvent.click(screen.getAllByTestId("dropdown-item")[0]);
        expect(pushMock).toHaveBeenCalledWith("/home/settings");
    });

    it("calls signOut and redirects on Logout", async () => {
        render(<TopBanner toggleSidePanel={jest.fn()} />);
        fireEvent.click(screen.getAllByTestId("dropdown-item")[1]);
        expect(signOut).toHaveBeenCalled();
        await Promise.resolve();
        expect(pushMock).toHaveBeenCalledWith("/");
    });
});