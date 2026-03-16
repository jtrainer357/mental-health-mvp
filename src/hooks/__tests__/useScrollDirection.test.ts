import { renderHook, act } from "@testing-library/react";
import { useScrollDirection } from "../useScrollDirection";

describe("useScrollDirection", () => {
  let scrollY = 0;

  beforeEach(() => {
    scrollY = 0;
    Object.defineProperty(window, "scrollY", {
      get: () => scrollY,
      configurable: true,
    });
  });

  function simulateScroll(y: number) {
    scrollY = y;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
  }

  it("returns null before any scroll", () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBeNull();
  });

  it("returns 'down' when scrolling down past threshold", () => {
    const { result } = renderHook(() => useScrollDirection({ threshold: 5 }));
    simulateScroll(10);
    expect(result.current).toBe("down");
  });

  it("returns 'up' when scrolling up past threshold", () => {
    const { result } = renderHook(() => useScrollDirection({ threshold: 5 }));
    simulateScroll(100);
    simulateScroll(90);
    expect(result.current).toBe("up");
  });

  it("does not change direction within threshold", () => {
    const { result } = renderHook(() => useScrollDirection({ threshold: 10 }));
    simulateScroll(100);
    expect(result.current).toBe("down");
    // Scroll up only 3px — within threshold
    simulateScroll(97);
    expect(result.current).toBe("down");
  });
});
