import React from "react";
import { render, screen } from "@testing-library/react";
import HomeLayout from "@/app/home/layout";

// Mock TopBanner and SidePanel with explicit prop types
jest.mock("@/components/topBanner", () => ({
    __esModule: true,
    default: ({ toggleSidePanel }: { toggleSidePanel: () => void }) => (
        <div data-testid="top-banner">
            TopBanner
            <button onClick={toggleSidePanel}>Toggle</button>
        </div>
    ),
}));
jest.mock("@/components/sidePanel", () => ({
    __esModule: true,
    default: ({ isSidePanelOpen }: { isSidePanelOpen: boolean }) => (
        <div data-testid="side-panel">{isSidePanelOpen ? "Open" : "Closed"}</div>
    ),
}));

describe("HomeLayout", () => {
    it("renders TopBanner, SidePanel, and children", () => {
        render(
            <HomeLayout>
                <div data-testid="main-content">Main Content</div>
            </HomeLayout>
        );

        expect(screen.getByTestId("top-banner")).toBeInTheDocument();
        expect(screen.getByTestId("side-panel")).toHaveTextContent("Open");
        expect(screen.getByTestId("main-content")).toBeInTheDocument();
    });
});