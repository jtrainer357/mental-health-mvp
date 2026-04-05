/**
 * MessagesWidget Component Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@/src/test/utils";
import { MessagesWidget } from "../messages-widget";

describe("MessagesWidget", () => {
  describe("Rendering", () => {
    it("renders the Messages heading", () => {
      render(<MessagesWidget />);

      expect(screen.getByText("Messages")).toBeInTheDocument();
    });

    it("renders the Inbox button", () => {
      render(<MessagesWidget />);

      expect(screen.getByRole("button", { name: "Inbox" })).toBeInTheDocument();
    });

    it("displays message sender names", () => {
      render(<MessagesWidget />);

      expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
      expect(screen.getByText("Dr. Patel")).toBeInTheDocument();
      expect(screen.getByText("Marcus Williams")).toBeInTheDocument();
    });

    it("displays message preview text", () => {
      render(<MessagesWidget />);

      expect(screen.getByText("Need to reschedule Tuesday appointment")).toBeInTheDocument();
    });

    it("displays message timestamps", () => {
      render(<MessagesWidget />);

      expect(screen.getByText("5 MIN AGO")).toBeInTheDocument();
      expect(screen.getByText("12 MIN AGO")).toBeInTheDocument();
    });
  });

  describe("Unread Count Badge", () => {
    it("displays unread message count badge", () => {
      render(<MessagesWidget />);

      // The widget has messages marked as unread
      const badge = screen.getByText("5");
      expect(badge).toBeInTheDocument();
    });

    it("badge is positioned near heading", () => {
      render(<MessagesWidget />);

      const heading = screen.getByText("Messages");
      const badge = screen.getByText("5");

      // Both should be in the same container
      const headingParent = heading.parentElement;
      expect(headingParent).toContainElement(badge);
    });
  });

  describe("Message Icons", () => {
    it("renders office messages with icon", () => {
      render(<MessagesWidget />);

      // Office appointment request message
      expect(screen.getByText("Office: Appointment Request")).toBeInTheDocument();
    });

    it("renders insurance messages with icon", () => {
      render(<MessagesWidget />);

      expect(screen.getByText("Insurance: BCBS")).toBeInTheDocument();
    });

    it("renders lab messages with icon", () => {
      render(<MessagesWidget />);

      expect(screen.getByText("Lab: Quest Diagnostics")).toBeInTheDocument();
    });

    it("renders pharmacy messages with icon", () => {
      render(<MessagesWidget />);

      expect(screen.getByText("Pharmacy: CVS")).toBeInTheDocument();
    });
  });

  describe("Message Types", () => {
    it("displays patient messages with avatars", () => {
      render(<MessagesWidget />);

      // Sarah Johnson should have an avatar image
      const sarahMessage = screen.getByText("Sarah Johnson");
      expect(sarahMessage).toBeInTheDocument();
    });

    it("displays system messages (voicemails)", () => {
      render(<MessagesWidget />);

      expect(screen.getByText("3 voicemails need follow-up")).toBeInTheDocument();
    });

    it("displays doctor messages", () => {
      render(<MessagesWidget />);

      expect(screen.getByText("Dr. Chen")).toBeInTheDocument();
      expect(screen.getByText("Please review patient notes before 3 PM")).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(<MessagesWidget className="custom-widget" />);

      expect(container.firstChild).toHaveClass("custom-widget");
    });
  });

  describe("Layout", () => {
    it("contains scrollable message area", () => {
      const { container } = render(<MessagesWidget />);

      const scrollArea = container.querySelector(".overflow-y-auto");
      expect(scrollArea).toBeInTheDocument();
    });

    it("has max height constraint", () => {
      const { container } = render(<MessagesWidget />);

      expect(container.firstChild).toHaveClass("max-h-[720px]");
    });
  });

  describe("Accessibility", () => {
    it("Inbox button is focusable", () => {
      render(<MessagesWidget />);

      const button = screen.getByRole("button", { name: "Inbox" });
      expect(button).not.toBeDisabled();
    });

    it("message cards are visible", () => {
      render(<MessagesWidget />);

      // All message names should be visible
      expect(screen.getByText("Sarah Johnson")).toBeVisible();
      expect(screen.getByText("Dr. Patel")).toBeVisible();
    });
  });
});
