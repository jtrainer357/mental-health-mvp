/**
 * Patients Page Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/src/test/utils";
import PatientsRoute from "../page";

// Mock the child components
vi.mock("../../_components/left-nav", () => ({
  LeftNav: ({ activePage }: { activePage: string }) => (
    <nav data-testid="left-nav" data-active-page={activePage}>
      Left Nav
    </nav>
  ),
}));

vi.mock("../../_components/header-search", () => ({
  HeaderSearch: () => <header data-testid="header-search">Header Search</header>,
}));

vi.mock("../../_components/patients-page", () => ({
  PatientsPage: ({
    initialPatientId,
    initialPatientName,
    initialTab,
  }: {
    initialPatientId?: string;
    initialPatientName?: string;
    initialTab?: string;
  }) => (
    <div
      data-testid="patients-page"
      data-patient-id={initialPatientId || ""}
      data-patient-name={initialPatientName || ""}
      data-tab={initialTab || ""}
    >
      Patients Page Content
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

vi.mock("@/design-system/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation");
  return {
    ...actual,
    useSearchParams: vi.fn(() => mockSearchParams),
    useRouter: vi.fn(() => ({
      replace: vi.fn(),
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    })),
  };
});

describe("PatientsRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("patient");
    mockSearchParams.delete("patientName");
    mockSearchParams.delete("tab");
  });

  describe("Layout", () => {
    it("renders the left navigation with patients as active page", async () => {
      render(<PatientsRoute />);

      await waitFor(() => {
        const nav = screen.getByTestId("left-nav");
        expect(nav).toBeInTheDocument();
        expect(nav).toHaveAttribute("data-active-page", "patients");
      });
    });

    it("renders the header search component", async () => {
      render(<PatientsRoute />);

      await waitFor(() => {
        expect(screen.getByTestId("header-search")).toBeInTheDocument();
      });
    });

    it("renders the animated background", async () => {
      render(<PatientsRoute />);

      await waitFor(() => {
        expect(screen.getByTestId("animated-background")).toBeInTheDocument();
      });
    });

    it("renders the page transition wrapper", async () => {
      render(<PatientsRoute />);

      await waitFor(() => {
        expect(screen.getByTestId("page-transition")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has main content landmark", async () => {
      render(<PatientsRoute />);

      await waitFor(() => {
        const main = screen.getByRole("main");
        expect(main).toBeInTheDocument();
      });
    });

    it("has correct aria-label for main content", async () => {
      render(<PatientsRoute />);

      await waitFor(() => {
        const main = screen.getByRole("main");
        expect(main).toHaveAttribute("aria-label", "Patients content");
      });
    });

    it("main content has correct id for skip links", async () => {
      render(<PatientsRoute />);

      await waitFor(() => {
        const main = screen.getByRole("main");
        expect(main).toHaveAttribute("id", "main-content");
      });
    });
  });

  describe("Patients Page Content", () => {
    it("renders patients page component", async () => {
      render(<PatientsRoute />);

      await waitFor(() => {
        expect(screen.getByTestId("patients-page")).toBeInTheDocument();
      });
    });

    it("displays patients page content", async () => {
      render(<PatientsRoute />);

      await waitFor(() => {
        expect(screen.getByText("Patients Page Content")).toBeInTheDocument();
      });
    });
  });

  describe("URL Parameters", () => {
    it("passes patient ID from URL to patients page", async () => {
      mockSearchParams.set("patient", "patient-123");

      render(<PatientsRoute />);

      await waitFor(() => {
        const patientsPage = screen.getByTestId("patients-page");
        expect(patientsPage).toHaveAttribute("data-patient-id", "patient-123");
      });
    });

    it("passes patient name from URL to patients page", async () => {
      mockSearchParams.set("patientName", "John Doe");

      render(<PatientsRoute />);

      await waitFor(() => {
        const patientsPage = screen.getByTestId("patients-page");
        expect(patientsPage).toHaveAttribute("data-patient-name", "John Doe");
      });
    });

    it("passes tab from URL to patients page", async () => {
      mockSearchParams.set("tab", "treatment");

      render(<PatientsRoute />);

      await waitFor(() => {
        const patientsPage = screen.getByTestId("patients-page");
        expect(patientsPage).toHaveAttribute("data-tab", "treatment");
      });
    });

    it("handles empty URL parameters", async () => {
      render(<PatientsRoute />);

      await waitFor(() => {
        const patientsPage = screen.getByTestId("patients-page");
        expect(patientsPage).toHaveAttribute("data-patient-id", "");
        expect(patientsPage).toHaveAttribute("data-patient-name", "");
        expect(patientsPage).toHaveAttribute("data-tab", "");
      });
    });
  });

  describe("Responsive Layout", () => {
    it("has minimum height screen styling", async () => {
      const { container } = render(<PatientsRoute />);

      await waitFor(() => {
        expect(container.firstChild).toHaveClass("min-h-screen");
      });
    });

    it("has bottom padding for mobile navigation", async () => {
      const { container } = render(<PatientsRoute />);

      await waitFor(() => {
        expect(container.firstChild).toHaveClass("pb-24");
        expect(container.firstChild).toHaveClass("md:pb-0");
      });
    });
  });
});
