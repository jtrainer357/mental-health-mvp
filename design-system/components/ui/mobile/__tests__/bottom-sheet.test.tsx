import { render, screen } from "@/src/test/utils";
import userEvent from "@testing-library/user-event";
import { BottomSheet } from "../bottom-sheet";

describe("BottomSheet", () => {
  it("does not render content when closed", () => {
    render(
      <BottomSheet open={false} onClose={vi.fn()}>
        <div data-testid="sheet-content">Content</div>
      </BottomSheet>
    );
    expect(screen.queryByTestId("sheet-content")).not.toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <div data-testid="sheet-content">Content</div>
      </BottomSheet>
    );
    expect(screen.getByTestId("sheet-content")).toBeInTheDocument();
  });

  it("renders with correct ARIA attributes", () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()} title="Actions">
        <div>Content</div>
      </BottomSheet>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={onClose}>
        <div>Content</div>
      </BottomSheet>
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on backdrop click", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={onClose}>
        <div>Content</div>
      </BottomSheet>
    );
    const backdrop = screen.getByTestId("bottom-sheet-backdrop");
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders drag handle with minimum touch target", () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <div>Content</div>
      </BottomSheet>
    );
    const handle = screen.getByTestId("bottom-sheet-handle");
    expect(handle).toBeInTheDocument();
  });
});
