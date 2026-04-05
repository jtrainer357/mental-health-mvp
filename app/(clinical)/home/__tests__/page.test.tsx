/**
 * Home Page Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/src/test/utils";
import HomePage from "../page";

// Mock the child components to isolate page-level testing
vi.mock("../_components/left-nav", () => ({
  LeftNav: () => <nav data-testid="left-nav">Left Nav</nav>,
}));

vi.mock("../_components/header-search", () => ({
  HeaderSearch: () => <header data-testid="header-search">Header Search</header>,
}));

vi.mock("../_components/dynamic-canvas", () => ({
  DynamicCanvas: ({ className }: { className?: string }) => (
    <div data-testid="dynamic-canvas" className={className}>
      Dynamic Canvas
    </div>
  ),
}));

vi.mock("../_components/messages-widget", () => ({
  MessagesWidget: () => <div data-testid="messages-widget">Messages Widget</div>,
}));

vi.mock("../_components/billing-upsell-widget", () => ({
  BillingUpsellWidget: () => <div data-testid="billing-upsell-widget">Billing Upsell</div>,
}));

vi.mock("../_components/welcome-modal", () => ({
  WelcomeModal: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="welcome-modal" onClick={() => onOpenChange(false)}>
        Welcome Modal
      </div>
    ) : null,
}));

vi.mock("@/design-system/components/ui/card-wrapper", () => ({
  CardWrapper: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-wrapper" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/design-system/components/ui/animated-background", () => ({
  AnimatedBackground: () => <div data-testid="animated-background" />,
}));

vi.mock("@/design-system/components/ui/page-transition", () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-transition">{children}</div>
  ),
}));

// Mock useSearchParams and useRouter
const mockReplace = vi.fn();
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation");
  return {
    ...actual,
    useSearchParams: vi.fn(() => new URLSearchParams()),
    useRouter: vi.fn(() => ({
      replace: mockReplace,
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    })),
  };
});

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Layout", () => {
    it("renders the main page structure", async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId("left-nav")).toBeInTheDocument();
      });
    });

    it("renders the header search component", async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId("header-search")).toBeInTheDocument();
      });
    });

    it("renders the dynamic canvas", async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId("dynamic-canvas")).toBeInTheDocument();
      });
    });

    it("renders the messages widget", async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId("messages-widget")).toBeInTheDocument();
      });
    });

    it("renders the billing upsell widget", async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId("billing-upsell-widget")).toBeInTheDocument();
      });
    });
  });

  describe("Animated Background", () => {
    it("renders the animated background", async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId("animated-background")).toBeInTheDocument();
      });
    });
  });

  describe("Page Transition", () => {
    it("wraps content in page transition", async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId("page-transition")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has main content landmark", async () => {
      render(<HomePage />);

      await waitFor(() => {
        const main = screen.getByRole("main");
        expect(main).toBeInTheDocument();
        expect(main).toHaveAttribute("aria-label", "Dashboard content");
      });
    });
  });

  describe("Setup Complete Flow", () => {
    it("does not show welcome modal by default", async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId("welcome-modal")).not.toBeInTheDocument();
      });
    });
  });
});
