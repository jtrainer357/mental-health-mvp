import { render, screen } from "@/src/test/utils";
import { SwipeBack } from "../swipe-back";

describe("SwipeBack", () => {
  it("renders children", () => {
    render(
      <SwipeBack onBack={vi.fn()}>
        <div data-testid="content">Hello</div>
      </SwipeBack>
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("does not render swipe zone when enabled=false", () => {
    const { container } = render(
      <SwipeBack onBack={vi.fn()} enabled={false}>
        <div>Hello</div>
      </SwipeBack>
    );
    expect(container.querySelector("[data-swipe-back]")).toBeNull();
  });

  it("renders swipe zone when enabled", () => {
    const { container } = render(
      <SwipeBack onBack={vi.fn()}>
        <div>Hello</div>
      </SwipeBack>
    );
    expect(container.querySelector("[data-swipe-back]")).toBeTruthy();
  });
});
