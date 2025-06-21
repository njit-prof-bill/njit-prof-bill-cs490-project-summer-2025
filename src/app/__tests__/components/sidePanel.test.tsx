import React from "react";
import { render, screen } from "@testing-library/react";
import SidePanel from "@/components/sidePanel";

// Mock next/link to render a regular anchor tag for testing
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe("SidePanel", () => {
    it("renders with side panel open", () => {
        render(<SidePanel isSidePanelOpen={true} />);
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
        // Panel should be visible (not translated off screen)
        expect(screen.getByRole("complementary")).toHaveClass("translate-x-0");
    });

    it("renders with side panel closed", () => {
        render(<SidePanel isSidePanelOpen={false} />);
        // Panel should be hidden (translated off screen)
        expect(screen.getByRole("complementary")).toHaveClass("-translate-x-full");
    });
});