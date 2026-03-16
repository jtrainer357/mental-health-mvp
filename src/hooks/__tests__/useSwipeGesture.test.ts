import { renderHook, act } from "@testing-library/react";
import { useSwipeGesture } from "../useSwipeGesture";

function createTouchEvent(type: string, x: number, y: number): TouchEvent {
  return new TouchEvent(type, {
    touches: type === "touchend" ? [] : [{ clientX: x, clientY: y } as Touch],
    changedTouches: [{ clientX: x, clientY: y } as Touch],
    bubbles: true,
  });
}

describe("useSwipeGesture", () => {
  it("starts with swiping=false and direction=null", () => {
    const { result } = renderHook(() => useSwipeGesture());
    expect(result.current.swiping).toBe(false);
    expect(result.current.direction).toBeNull();
    expect(result.current.distance).toBe(0);
  });

  it("detects horizontal swipe right", () => {
    const onSwipe = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ direction: "horizontal", threshold: 50, onSwipe })
    );

    const el = document.createElement("div");
    (result.current.ref as { current: HTMLElement }).current = el;

    act(() => {
      el.dispatchEvent(createTouchEvent("touchstart", 0, 100));
      el.dispatchEvent(createTouchEvent("touchmove", 30, 100));
    });
    expect(result.current.swiping).toBe(true);
    expect(result.current.direction).toBe("right");

    act(() => {
      el.dispatchEvent(createTouchEvent("touchmove", 60, 100));
      el.dispatchEvent(createTouchEvent("touchend", 60, 100));
    });
    expect(onSwipe).toHaveBeenCalledWith("right");
  });

  it("respects edgeZone — ignores touches outside zone", () => {
    const onSwipe = vi.fn();
    const { result } = renderHook(() => useSwipeGesture({ edgeZone: 30, threshold: 20, onSwipe }));

    const el = document.createElement("div");
    (result.current.ref as { current: HTMLElement }).current = el;

    act(() => {
      el.dispatchEvent(createTouchEvent("touchstart", 50, 100));
      el.dispatchEvent(createTouchEvent("touchmove", 100, 100));
      el.dispatchEvent(createTouchEvent("touchend", 100, 100));
    });
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it("locks direction after initial movement", () => {
    const { result } = renderHook(() =>
      useSwipeGesture({ direction: "horizontal", threshold: 50 })
    );

    const el = document.createElement("div");
    (result.current.ref as { current: HTMLElement }).current = el;

    act(() => {
      el.dispatchEvent(createTouchEvent("touchstart", 100, 100));
      el.dispatchEvent(createTouchEvent("touchmove", 120, 103));
    });
    expect(result.current.direction).toBe("right");
  });
});
