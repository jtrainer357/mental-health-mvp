# Mobile-Native Primitives Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 5 reusable mobile-native components + 3 hooks that give the app iOS/Android-like feel on mobile (<1024px).

**Architecture:** Extract mobile behaviors from patients-page.tsx into shared primitives in `design-system/components/ui/mobile/`. Hooks go in `src/hooks/`. All primitives are mobile-only and become no-ops on desktop. Refactor-first approach: extract `MobileNavStack` from working patients code, then build remaining components.

**Tech Stack:** React 18, TypeScript strict, Framer Motion (installed), Vitest + testing-library (configured), Tebra design tokens.

**Spec:** `docs/superpowers/specs/2026-03-16-mobile-native-primitives-design.md`

---

## File Structure

### New Files

| File                                                                       | Responsibility                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `src/hooks/useMobileDetect.ts`                                             | Viewport detection: isMobile/isTablet/isDesktop/isTouchDevice |
| `src/hooks/useScrollDirection.ts`                                          | Scroll direction tracking with threshold                      |
| `src/hooks/useSwipeGesture.ts`                                             | Touch swipe gesture detection with direction lock             |
| `src/hooks/__tests__/useMobileDetect.test.ts`                              | Tests for viewport detection                                  |
| `src/hooks/__tests__/useScrollDirection.test.ts`                           | Tests for scroll direction                                    |
| `src/hooks/__tests__/useSwipeGesture.test.ts`                              | Tests for swipe gesture                                       |
| `design-system/components/ui/mobile/swipe-back.tsx`                        | Edge swipe to go back                                         |
| `design-system/components/ui/mobile/mobile-nav-stack.tsx`                  | Push/pop navigation container                                 |
| `design-system/components/ui/mobile/bottom-sheet.tsx`                      | Drag-to-dismiss modal sheet                                   |
| `design-system/components/ui/mobile/pull-to-refresh.tsx`                   | Overscroll refresh wrapper                                    |
| `design-system/components/ui/mobile/collapsible-header.tsx`                | iOS-style collapsing title                                    |
| `design-system/components/ui/mobile/index.ts`                              | Barrel exports for mobile components                          |
| `design-system/components/ui/mobile/__tests__/swipe-back.test.tsx`         | Tests                                                         |
| `design-system/components/ui/mobile/__tests__/mobile-nav-stack.test.tsx`   | Tests                                                         |
| `design-system/components/ui/mobile/__tests__/bottom-sheet.test.tsx`       | Tests                                                         |
| `design-system/components/ui/mobile/__tests__/pull-to-refresh.test.tsx`    | Tests                                                         |
| `design-system/components/ui/mobile/__tests__/collapsible-header.test.tsx` | Tests                                                         |

### Modified Files

| File                                              | Change                                                           |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| `src/hooks/index.ts`                              | Add exports for 3 new hooks                                      |
| `app/home/_components/patients/patients-page.tsx` | Replace inline mobile code with MobileNavStack + useMobileDetect |

---

## Chunk 1: Hooks

### Task 1: `useMobileDetect` hook

**Files:**

- Create: `src/hooks/useMobileDetect.ts`
- Create: `src/hooks/__tests__/useMobileDetect.test.ts`
- Modify: `src/hooks/index.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/__tests__/useMobileDetect.test.ts`:

```typescript
import { renderHook, act } from "@testing-library/react";
import { useMobileDetect } from "../useMobileDetect";

// Helper to mock matchMedia for specific breakpoint
function mockViewport(width: number) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => {
      let matches = false;
      if (query === "(max-width: 767px)") matches = width < 768;
      if (query === "(min-width: 768px) and (max-width: 1023px)")
        matches = width >= 768 && width < 1024;

      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });
}

describe("useMobileDetect", () => {
  it("returns isMobile=true for viewport <768px", () => {
    mockViewport(375);
    const { result } = renderHook(() => useMobileDetect());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouchDevice).toBe(true);
  });

  it("returns isTablet=true for viewport 768-1023px", () => {
    mockViewport(768);
    const { result } = renderHook(() => useMobileDetect());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouchDevice).toBe(true);
  });

  it("returns isDesktop=true for viewport >=1024px", () => {
    mockViewport(1280);
    const { result } = renderHook(() => useMobileDetect());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTouchDevice).toBe(false);
  });

  it("defaults to false for all values (SSR-safe)", () => {
    // matchMedia returning no matches simulates SSR/unknown
    mockViewport(0);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    const { result } = renderHook(() => useMobileDetect());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouchDevice).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useMobileDetect.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `src/hooks/useMobileDetect.ts`:

```typescript
"use client";

import { useState, useEffect } from "react";

interface MobileDetectResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
}

const MOBILE_QUERY = "(max-width: 767px)";
const TABLET_QUERY = "(min-width: 768px) and (max-width: 1023px)";

/**
 * Detects viewport size category using matchMedia.
 * Mobile: <768px, Tablet: 768-1023px, Desktop: >=1024px.
 * SSR-safe — all values default to false until mounted.
 */
export function useMobileDetect(): MobileDetectResult {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const tabletQuery = window.matchMedia(TABLET_QUERY);

    const update = () => {
      setIsMobile(mobileQuery.matches);
      setIsTablet(tabletQuery.matches);
    };

    update();

    mobileQuery.addEventListener("change", update);
    tabletQuery.addEventListener("change", update);

    return () => {
      mobileQuery.removeEventListener("change", update);
      tabletQuery.removeEventListener("change", update);
    };
  }, []);

  const isDesktop = !isMobile && !isTablet;
  const isTouchDevice = isMobile || isTablet;

  return { isMobile, isTablet, isDesktop, isTouchDevice };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useMobileDetect.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Export from hooks index**

Add to `src/hooks/index.ts`:

```typescript
export { useMobileDetect } from "./useMobileDetect";
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useMobileDetect.ts src/hooks/__tests__/useMobileDetect.test.ts src/hooks/index.ts
git commit -m "feat(hooks): add useMobileDetect for viewport detection"
```

---

### Task 2: `useScrollDirection` hook

**Files:**

- Create: `src/hooks/useScrollDirection.ts`
- Create: `src/hooks/__tests__/useScrollDirection.test.ts`
- Modify: `src/hooks/index.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/__tests__/useScrollDirection.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useScrollDirection.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `src/hooks/useScrollDirection.ts`:

```typescript
"use client";

import { useState, useEffect, type RefObject } from "react";

interface ScrollDirectionOptions {
  threshold?: number;
  targetRef?: RefObject<HTMLElement | null>;
}

/**
 * Tracks scroll direction with configurable threshold to prevent jitter.
 * Returns "up", "down", or null (before first scroll).
 */
export function useScrollDirection(options: ScrollDirectionOptions = {}): "up" | "down" | null {
  const { threshold = 5, targetRef } = options;
  const [direction, setDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const target = targetRef?.current ?? window;
    let lastScrollY = target === window ? window.scrollY : (target as HTMLElement).scrollTop;

    const handleScroll = () => {
      const currentY = target === window ? window.scrollY : (target as HTMLElement).scrollTop;
      const delta = currentY - lastScrollY;

      if (Math.abs(delta) >= threshold) {
        setDirection(delta > 0 ? "down" : "up");
        lastScrollY = currentY;
      }
    };

    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => target.removeEventListener("scroll", handleScroll);
  }, [threshold, targetRef]);

  return direction;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useScrollDirection.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Export from hooks index**

Add to `src/hooks/index.ts`:

```typescript
export { useScrollDirection } from "./useScrollDirection";
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useScrollDirection.ts src/hooks/__tests__/useScrollDirection.test.ts src/hooks/index.ts
git commit -m "feat(hooks): add useScrollDirection for scroll tracking"
```

---

### Task 3: `useSwipeGesture` hook

**Files:**

- Create: `src/hooks/useSwipeGesture.ts`
- Create: `src/hooks/__tests__/useSwipeGesture.test.ts`
- Modify: `src/hooks/index.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/__tests__/useSwipeGesture.test.ts`:

```typescript
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
    // Manually assign ref
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

    // Touch starts at x=50, outside 30px edge zone
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
      // Move primarily horizontal
      el.dispatchEvent(createTouchEvent("touchmove", 120, 103));
    });
    expect(result.current.direction).toBe("right");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useSwipeGesture.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `src/hooks/useSwipeGesture.ts`:

```typescript
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SwipeGestureOptions {
  threshold?: number;
  edgeZone?: number;
  direction?: "horizontal" | "vertical" | "both";
  onSwipe?: (direction: "left" | "right" | "up" | "down") => void;
}

interface SwipeGestureResult {
  ref: React.RefObject<HTMLElement | null>;
  swiping: boolean;
  direction: "left" | "right" | "up" | "down" | null;
  distance: number;
  velocity: number;
  progress: number;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

/**
 * Tracks touch swipe gestures on a ref element.
 * Supports direction locking, edge zones, and velocity calculation.
 */
export function useSwipeGesture(options: SwipeGestureOptions = {}): SwipeGestureResult {
  const { threshold = 50, edgeZone, direction: directionLock = "both", onSwipe } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<{
    swiping: boolean;
    direction: "left" | "right" | "up" | "down" | null;
    distance: number;
    velocity: number;
  }>({ swiping: false, direction: null, distance: 0, velocity: 0 });

  // Use refs for values accessed in event handlers to avoid re-attaching listeners
  const stateRef = useRef(state);
  stateRef.current = state;

  const startPoint = useRef<TouchPoint | null>(null);
  const recentPoints = useRef<TouchPoint[]>([]);
  const lockedDirection = useRef<"horizontal" | "vertical" | null>(null);
  const inEdgeZone = useRef(false);
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;
  // Track current distance/direction in refs for touchend handler
  const currentDistance = useRef(0);
  const currentDirection = useRef<"left" | "right" | "up" | "down" | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      // Edge zone check
      if (edgeZone !== undefined && touch.clientX > edgeZone) {
        inEdgeZone.current = false;
        return;
      }
      inEdgeZone.current = true;

      const point: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      startPoint.current = point;
      recentPoints.current = [point];
      lockedDirection.current = null;
      currentDistance.current = 0;
      currentDirection.current = null;
      setState({ swiping: true, direction: null, distance: 0, velocity: 0 });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startPoint.current) return;
      if (edgeZone !== undefined && !inEdgeZone.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      const dx = touch.clientX - startPoint.current.x;
      const dy = touch.clientY - startPoint.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Lock direction after 10px of movement
      if (!lockedDirection.current && (absDx > 10 || absDy > 10)) {
        lockedDirection.current = absDx > absDy ? "horizontal" : "vertical";
      }

      // Apply direction filter
      if (directionLock === "horizontal" && lockedDirection.current === "vertical") return;
      if (directionLock === "vertical" && lockedDirection.current === "horizontal") return;

      // Calculate direction and distance
      let swipeDir: "left" | "right" | "up" | "down";
      let dist: number;

      if (lockedDirection.current === "horizontal" || absDx > absDy) {
        swipeDir = dx > 0 ? "right" : "left";
        dist = absDx;
      } else {
        swipeDir = dy > 0 ? "down" : "up";
        dist = absDy;
      }

      // Update refs (for touchend) and state (for consumers)
      currentDistance.current = dist;
      currentDirection.current = swipeDir;

      // Track recent points for velocity
      const now = Date.now();
      recentPoints.current.push({ x: touch.clientX, y: touch.clientY, time: now });
      if (recentPoints.current.length > 3) {
        recentPoints.current.shift();
      }

      // Calculate velocity from refs
      let vel = 0;
      const points = recentPoints.current;
      if (points.length >= 2) {
        const first = points[0]!;
        const last = points[points.length - 1]!;
        const timeDelta = last.time - first.time;
        if (timeDelta > 0) {
          vel = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2) / timeDelta;
        }
      }

      setState({ swiping: true, direction: swipeDir, distance: dist, velocity: vel });
    };

    const handleTouchEnd = () => {
      if (!startPoint.current) return;
      if (edgeZone !== undefined && !inEdgeZone.current) {
        setState({ swiping: false, direction: null, distance: 0, velocity: 0 });
        startPoint.current = null;
        return;
      }

      // Fire onSwipe if threshold met — read from refs, not stale closure
      if (currentDistance.current >= threshold && currentDirection.current && onSwipeRef.current) {
        onSwipeRef.current(currentDirection.current);
      }

      setState({ swiping: false, direction: null, distance: 0, velocity: 0 });
      startPoint.current = null;
      recentPoints.current = [];
      lockedDirection.current = null;
      inEdgeZone.current = false;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [threshold, edgeZone, directionLock]);

  const progress = threshold > 0 ? Math.min(state.distance / threshold, 1) : 0;

  return { ref, ...state, progress };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useSwipeGesture.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Export from hooks index**

Add to `src/hooks/index.ts`:

```typescript
export { useSwipeGesture } from "./useSwipeGesture";
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useSwipeGesture.ts src/hooks/__tests__/useSwipeGesture.test.ts src/hooks/index.ts
git commit -m "feat(hooks): add useSwipeGesture for touch gesture detection"
```

---

## Chunk 2: Core Components (SwipeBack + MobileNavStack) & Patients Refactor

### Task 4: `SwipeBack` component

**Files:**

- Create: `design-system/components/ui/mobile/swipe-back.tsx`
- Create: `design-system/components/ui/mobile/__tests__/swipe-back.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `design-system/components/ui/mobile/__tests__/swipe-back.test.tsx`:

```tsx
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
    // When disabled, should just render children directly
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run design-system/components/ui/mobile/__tests__/swipe-back.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `design-system/components/ui/mobile/swipe-back.tsx`:

```tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useSwipeGesture } from "@/src/hooks/useSwipeGesture";

interface SwipeBackProps {
  onBack: () => void;
  enabled?: boolean;
  children: ReactNode;
}

/**
 * Wraps content with iOS-style edge-swipe-to-go-back gesture.
 * Swipe from left 30px edge zone to trigger onBack.
 */
export function SwipeBack({ onBack, enabled = true, children }: SwipeBackProps) {
  const x = useMotionValue(0);
  const shadow = useTransform(
    x,
    [0, 200],
    ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 20px rgba(0,0,0,0.15)"]
  );

  const { ref, swiping, distance, velocity, direction } = useSwipeGesture({
    edgeZone: 30,
    direction: "horizontal",
    threshold: 100,
    onSwipe: (dir) => {
      if (dir === "right") {
        void animate(x, window.innerWidth, {
          type: "spring",
          stiffness: 400,
          damping: 30,
          onComplete: onBack,
        });
      }
    },
  });

  // Update x position during swipe — in useEffect, not render
  useEffect(() => {
    if (swiping && direction === "right" && enabled) {
      const halfWidth = (typeof window !== "undefined" ? window.innerWidth : 400) / 2;
      const mappedX = distance <= halfWidth ? distance : halfWidth + (distance - halfWidth) * 0.5;
      x.set(mappedX);
    } else if (!swiping && x.get() !== 0) {
      // Spring back if swipe ended without triggering onSwipe
      void animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }, [swiping, distance, direction, enabled, x]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      data-swipe-back
      style={{ x, boxShadow: shadow }}
      className="relative h-full w-full"
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run design-system/components/ui/mobile/__tests__/swipe-back.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add design-system/components/ui/mobile/swipe-back.tsx design-system/components/ui/mobile/__tests__/swipe-back.test.tsx
git commit -m "feat(mobile): add SwipeBack component for edge-swipe navigation"
```

---

### Task 5: `MobileNavStack` component

**Files:**

- Create: `design-system/components/ui/mobile/mobile-nav-stack.tsx`
- Create: `design-system/components/ui/mobile/__tests__/mobile-nav-stack.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `design-system/components/ui/mobile/__tests__/mobile-nav-stack.test.tsx`:

```tsx
import { render, screen } from "@/src/test/utils";
import { MobileNavStack } from "../mobile-nav-stack";

describe("MobileNavStack", () => {
  it("renders listView when showDetail=false", () => {
    render(
      <MobileNavStack
        showDetail={false}
        listView={<div data-testid="list">List</div>}
        detailView={<div data-testid="detail">Detail</div>}
      />
    );
    expect(screen.getByTestId("list")).toBeInTheDocument();
    expect(screen.queryByTestId("detail")).not.toBeInTheDocument();
  });

  it("renders detailView when showDetail=true", () => {
    render(
      <MobileNavStack
        showDetail={true}
        listView={<div data-testid="list">List</div>}
        detailView={<div data-testid="detail">Detail</div>}
      />
    );
    expect(screen.queryByTestId("list")).not.toBeInTheDocument();
    expect(screen.getByTestId("detail")).toBeInTheDocument();
  });
});
```

**Note:** `MobileNavStack` always renders — consumers guard with `useMobileDetect().isTouchDevice`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run design-system/components/ui/mobile/__tests__/mobile-nav-stack.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `design-system/components/ui/mobile/mobile-nav-stack.tsx`:

```tsx
"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SwipeBack } from "./swipe-back";

interface MobileNavStackProps {
  showDetail: boolean;
  onBack?: () => void;
  listView: ReactNode;
  detailView: ReactNode;
  enableSwipeBack?: boolean;
  className?: string;
}

const SLIDE_EASING = [0.25, 0.1, 0.25, 1.0] as const;
const SLIDE_DURATION = 0.25;

/**
 * Generic push/pop mobile navigation container.
 * Shows listView or detailView with iOS-style slide transitions.
 * Consumers should guard rendering with useMobileDetect().isTouchDevice.
 */
export function MobileNavStack({
  showDetail,
  onBack,
  listView,
  detailView,
  enableSwipeBack = true,
  className,
}: MobileNavStackProps) {
  return (
    <div className={`flex h-full flex-col overflow-hidden ${className ?? ""}`}>
      <AnimatePresence mode="wait" initial={false}>
        {!showDetail ? (
          <motion.div
            key="list"
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: SLIDE_DURATION, ease: SLIDE_EASING as unknown as number[] }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {listView}
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ duration: SLIDE_DURATION, ease: SLIDE_EASING as unknown as number[] }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {enableSwipeBack && onBack ? (
              <SwipeBack onBack={onBack}>{detailView}</SwipeBack>
            ) : (
              detailView
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run design-system/components/ui/mobile/__tests__/mobile-nav-stack.test.tsx`
Expected: PASS (adjust tests if third test needs removal per note above)

- [ ] **Step 5: Commit**

```bash
git add design-system/components/ui/mobile/mobile-nav-stack.tsx design-system/components/ui/mobile/__tests__/mobile-nav-stack.test.tsx
git commit -m "feat(mobile): add MobileNavStack push/pop navigation container"
```

---

### Task 6: Create barrel export

**Files:**

- Create: `design-system/components/ui/mobile/index.ts`

- [ ] **Step 1: Create barrel export**

Create `design-system/components/ui/mobile/index.ts`:

```typescript
export { SwipeBack } from "./swipe-back";
export { MobileNavStack } from "./mobile-nav-stack";
```

- [ ] **Step 2: Commit**

```bash
git add design-system/components/ui/mobile/index.ts
git commit -m "chore(mobile): add barrel exports for mobile components"
```

---

### Task 7: Refactor patients-page.tsx

**Files:**

- Modify: `app/home/_components/patients/patients-page.tsx`

- [ ] **Step 1: Verify build passes before refactor**

Run: `npm run build`
Expected: PASS

- [ ] **Step 2: Replace `useIsMobileView` with `useMobileDetect`**

In `app/home/_components/patients/patients-page.tsx`:

1. Remove the inline `useIsMobileView` function (lines 29-40)
2. Add import: `import { useMobileDetect } from "@/src/hooks/useMobileDetect";`
3. Replace `const isMobile = useIsMobileView();` with `const { isTouchDevice } = useMobileDetect();`
4. Replace `if (isMobile)` on line 177 with `if (isTouchDevice)`
5. Replace `if (isMobile)` on line 212 with `if (isTouchDevice)`

- [ ] **Step 3: Replace mobile AnimatePresence block with MobileNavStack**

In `app/home/_components/patients/patients-page.tsx`:

1. Add import: `import { MobileNavStack } from "@/design-system/components/ui/mobile";`
2. Remove `import { motion, AnimatePresence } from "framer-motion";` (only if motion is not used in desktop section — check first; it IS used in desktop section at line 291, so keep the import)
3. Replace the mobile return block (the `if (isTouchDevice)` branch, lines ~212-281) with:

```tsx
if (isTouchDevice) {
  return (
    <>
      <MobileNavStack
        showDetail={mobileShowDetail}
        onBack={handleBackToRoster}
        listView={
          <>
            <div className="mb-3 flex items-center justify-between">
              <FilterTabs
                tabs={patientFilterTabs}
                activeTab={activeFilter}
                onTabChange={setActiveFilter}
              />
              <Button onClick={() => setAddPatientOpen(true)} size="sm" className="gap-1.5 text-sm">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <PatientListSidebar
              patients={patientListItems}
              selectedPatientId={selectedPatient?.id}
              onPatientSelect={handlePatientSelect}
              activeFilter={activeFilter}
              compact={false}
              className="min-h-0 flex-1"
            />
          </>
        }
        detailView={
          detailLoading ? (
            <PatientDetailSkeleton />
          ) : (
            <PatientDetailView
              patient={patientDetails}
              className="min-h-0 flex-1"
              initialTab={initialTab}
              onBackToRoster={handleBackToRoster}
            />
          )
        }
      />

      <AddPatientModal
        open={addPatientOpen}
        onOpenChange={setAddPatientOpen}
        onPatientCreated={handlePatientCreated}
      />
    </>
  );
}
```

- [ ] **Step 4: Verify build passes after refactor**

Run: `npm run build`
Expected: PASS with zero errors

- [ ] **Step 5: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add app/home/_components/patients/patients-page.tsx
git commit -m "refactor(patients): use MobileNavStack + useMobileDetect instead of inline code"
```

---

## Chunk 3: Remaining Components (BottomSheet, PullToRefresh, CollapsibleHeader)

### Task 8: `BottomSheet` component

**Files:**

- Create: `design-system/components/ui/mobile/bottom-sheet.tsx`
- Create: `design-system/components/ui/mobile/__tests__/bottom-sheet.test.tsx`
- Modify: `design-system/components/ui/mobile/index.ts`

- [ ] **Step 1: Write the failing test**

Create `design-system/components/ui/mobile/__tests__/bottom-sheet.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run design-system/components/ui/mobile/__tests__/bottom-sheet.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `design-system/components/ui/mobile/bottom-sheet.tsx`:

```tsx
"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useSwipeGesture } from "@/src/hooks/useSwipeGesture";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  snapPoints?: number[];
  initialSnap?: number;
  title?: string;
  children: ReactNode;
}

/**
 * Drag-to-dismiss modal sheet for contextual actions.
 * Accessible with focus trapping, Escape to close, ARIA attributes.
 */
export function BottomSheet({
  open,
  onClose,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  title,
  children,
}: BottomSheetProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const y = useMotionValue(0);

  // Store the element that had focus before opening
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Lock body scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Restore focus
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus trap + Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const sheet = sheetRef.current;
        if (!sheet) return;

        const focusable = sheet.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Auto-focus the sheet
    requestAnimationFrame(() => {
      sheetRef.current?.focus();
    });

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Drag handling
  const {
    ref: dragRef,
    swiping,
    distance,
    velocity,
    direction,
  } = useSwipeGesture({
    direction: "vertical",
    threshold: 50,
  });

  // Update y during drag
  useEffect(() => {
    if (swiping && direction === "down") {
      y.set(distance);
    } else if (!swiping && distance > 0) {
      // Check dismiss conditions
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
      const sheetHeight = viewportHeight * (snapPoints[initialSnap] ?? 0.5);

      if (velocity > 0.5 || distance > sheetHeight * 0.75) {
        void animate(y, viewportHeight, {
          type: "spring",
          stiffness: 400,
          damping: 30,
          onComplete: onClose,
        });
      } else {
        // Find nearest snap point
        void animate(y, 0, {
          type: "spring",
          stiffness: 400,
          damping: 30,
        });
      }
    }
  }, [swiping, distance, velocity, direction, y, onClose, snapPoints, initialSnap]);

  if (typeof window === "undefined") return null;

  const sheetHeight = `${(snapPoints[initialSnap] ?? 0.5) * 100}vh`;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            data-testid="bottom-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={(node) => {
              (sheetRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              (dragRef as React.MutableRefObject<HTMLElement | null>).current = node;
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ y, maxHeight: "90vh", height: sheetHeight }}
            className="bg-backbone-1 fixed inset-x-0 bottom-0 z-50 rounded-t-2xl outline-none"
          >
            {/* Drag handle */}
            <div
              data-testid="bottom-sheet-handle"
              className="flex h-11 w-full items-center justify-center"
            >
              <div className="bg-synapse-3 h-1 w-10 rounded-full" />
            </div>

            {/* Title */}
            {title && (
              <div className="px-4 pb-3">
                <h2 id={titleId} className="text-synapse-7 text-lg font-semibold">
                  {title}
                </h2>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto px-4 pb-8">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run design-system/components/ui/mobile/__tests__/bottom-sheet.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Add to barrel export**

Add to `design-system/components/ui/mobile/index.ts`:

```typescript
export { BottomSheet } from "./bottom-sheet";
```

- [ ] **Step 6: Commit**

```bash
git add design-system/components/ui/mobile/bottom-sheet.tsx design-system/components/ui/mobile/__tests__/bottom-sheet.test.tsx design-system/components/ui/mobile/index.ts
git commit -m "feat(mobile): add BottomSheet with drag-to-dismiss and accessibility"
```

---

### Task 9: `PullToRefresh` component

**Files:**

- Create: `design-system/components/ui/mobile/pull-to-refresh.tsx`
- Create: `design-system/components/ui/mobile/__tests__/pull-to-refresh.test.tsx`
- Modify: `design-system/components/ui/mobile/index.ts`

- [ ] **Step 1: Write the failing test**

Create `design-system/components/ui/mobile/__tests__/pull-to-refresh.test.tsx`:

```tsx
import { render, screen } from "@/src/test/utils";
import { PullToRefresh } from "../pull-to-refresh";

describe("PullToRefresh", () => {
  it("renders children", () => {
    render(
      <PullToRefresh onRefresh={async () => {}}>
        <div data-testid="content">Content</div>
      </PullToRefresh>
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("does not show spinner initially", () => {
    render(
      <PullToRefresh onRefresh={async () => {}}>
        <div>Content</div>
      </PullToRefresh>
    );
    expect(screen.queryByTestId("pull-to-refresh-spinner")).not.toBeInTheDocument();
  });

  it("renders with correct container structure", () => {
    const { container } = render(
      <PullToRefresh onRefresh={async () => {}}>
        <div>Content</div>
      </PullToRefresh>
    );
    const wrapper = container.querySelector("[data-pull-to-refresh]");
    expect(wrapper).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run design-system/components/ui/mobile/__tests__/pull-to-refresh.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `design-system/components/ui/mobile/pull-to-refresh.tsx`:

```tsx
"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

const PULL_THRESHOLD = 60;
const SHOW_SPINNER_AT = 40;

/**
 * Pull-to-refresh wrapper with rubber-band overscroll effect.
 * Touch-only, activates when scroll position is at top.
 */
export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || refreshing) return;
      const container = containerRef.current;
      if (!container || container.scrollTop > 0) return;

      const touch = e.touches[0];
      if (!touch) return;
      startY.current = touch.clientY;
      pulling.current = true;
    },
    [disabled, refreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || disabled || refreshing) return;
      const container = containerRef.current;
      if (!container || container.scrollTop > 0) {
        pulling.current = false;
        setPullDistance(0);
        return;
      }

      const touch = e.touches[0];
      if (!touch) return;
      const dy = touch.clientY - startY.current;

      if (dy > 0) {
        // Rubber band: diminishing returns past threshold
        const dampened = dy < PULL_THRESHOLD ? dy : PULL_THRESHOLD + (dy - PULL_THRESHOLD) * 0.3;
        setPullDistance(dampened);
      }
    },
    [disabled, refreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullDistance >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(48); // Hold at spinner position
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, refreshing, onRefresh]);

  const showSpinner = pullDistance >= SHOW_SPINNER_AT || refreshing;

  return (
    <div
      ref={containerRef}
      data-pull-to-refresh
      className={`relative overflow-y-auto ${className ?? ""}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
    >
      {/* Spinner */}
      {showSpinner && (
        <div
          data-testid="pull-to-refresh-spinner"
          className="flex items-center justify-center py-3"
          style={{ height: 48 }}
        >
          <div
            className={`border-growth-2 h-6 w-6 rounded-full border-2 border-t-transparent ${
              refreshing ? "animate-spin" : ""
            }`}
            style={{
              opacity: refreshing ? 1 : Math.min(pullDistance / PULL_THRESHOLD, 1),
              transform: refreshing
                ? undefined
                : `rotate(${(pullDistance / PULL_THRESHOLD) * 270}deg)`,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: pullDistance > 0 && !refreshing ? `translateY(${pullDistance}px)` : undefined,
          transition: pulling.current ? "none" : "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run design-system/components/ui/mobile/__tests__/pull-to-refresh.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Add to barrel export**

Add to `design-system/components/ui/mobile/index.ts`:

```typescript
export { PullToRefresh } from "./pull-to-refresh";
```

- [ ] **Step 6: Commit**

```bash
git add design-system/components/ui/mobile/pull-to-refresh.tsx design-system/components/ui/mobile/__tests__/pull-to-refresh.test.tsx design-system/components/ui/mobile/index.ts
git commit -m "feat(mobile): add PullToRefresh with rubber-band overscroll"
```

---

### Task 10: `CollapsibleHeader` component

**Files:**

- Create: `design-system/components/ui/mobile/collapsible-header.tsx`
- Create: `design-system/components/ui/mobile/__tests__/collapsible-header.test.tsx`
- Modify: `design-system/components/ui/mobile/index.ts`

- [ ] **Step 1: Write the failing test**

Create `design-system/components/ui/mobile/__tests__/collapsible-header.test.tsx`:

```tsx
import { render, screen } from "@/src/test/utils";
import { CollapsibleHeader } from "../collapsible-header";

describe("CollapsibleHeader", () => {
  it("renders title in large state", () => {
    render(
      <CollapsibleHeader title="Patients">
        <div>Content</div>
      </CollapsibleHeader>
    );
    expect(screen.getByText("Patients")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(
      <CollapsibleHeader title="Patients" actions={<button data-testid="action-btn">Add</button>}>
        <div>Content</div>
      </CollapsibleHeader>
    );
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <CollapsibleHeader title="Test">
        <div data-testid="content">Scrollable content</div>
      </CollapsibleHeader>
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run design-system/components/ui/mobile/__tests__/collapsible-header.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `design-system/components/ui/mobile/collapsible-header.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useScrollDirection } from "@/src/hooks/useScrollDirection";

interface CollapsibleHeaderProps {
  title: string;
  collapsedTitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

const SPRING_CONFIG = { stiffness: 300, damping: 25 };
const EXPAND_SCROLL_THRESHOLD = 100;

/**
 * iOS-style large title header that collapses to compact on scroll down.
 * Re-expands on scroll up when near top of content.
 */
export function CollapsibleHeader({
  title,
  collapsedTitle,
  actions,
  children,
  className,
}: CollapsibleHeaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const scrollDirection = useScrollDirection({ targetRef: contentRef });

  // Collapse/expand in useEffect to avoid setState during render
  useEffect(() => {
    const scrollTop = contentRef.current?.scrollTop ?? 0;

    if (scrollDirection === "down" && !collapsed) {
      setCollapsed(true);
    } else if (scrollDirection === "up" && collapsed && scrollTop < EXPAND_SCROLL_THRESHOLD) {
      setCollapsed(false);
    }
  }, [scrollDirection, collapsed]);

  return (
    <div className={`flex h-full flex-col ${className ?? ""}`}>
      {/* Header */}
      <motion.div
        className="border-synapse-2 bg-backbone-1 sticky top-0 z-10 flex items-center border-b px-4"
        animate={{
          height: collapsed ? 48 : 80,
        }}
        transition={{ type: "spring", ...SPRING_CONFIG }}
      >
        <motion.h1
          className="text-synapse-7 flex-1"
          animate={{
            fontSize: collapsed ? "16px" : "24px",
            fontWeight: collapsed ? 600 : 700,
          }}
          transition={{ type: "spring", ...SPRING_CONFIG }}
        >
          {collapsed ? (collapsedTitle ?? title) : title}
        </motion.h1>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </motion.div>

      {/* Scrollable content */}
      <div
        ref={contentRef}
        className="min-h-0 flex-1 overflow-y-auto"
        style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run design-system/components/ui/mobile/__tests__/collapsible-header.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Add to barrel export**

Add to `design-system/components/ui/mobile/index.ts`:

```typescript
export { CollapsibleHeader } from "./collapsible-header";
```

- [ ] **Step 6: Commit**

```bash
git add design-system/components/ui/mobile/collapsible-header.tsx design-system/components/ui/mobile/__tests__/collapsible-header.test.tsx design-system/components/ui/mobile/index.ts
git commit -m "feat(mobile): add CollapsibleHeader with scroll-driven collapse"
```

---

## Chunk 4: Final Verification

### Task 11: Full build and test verification

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Manual verification checklist**

Verify at 375px and 768px viewports:

- Patients page: roster → detail transition works with slide animation
- Patients page: back button works
- Desktop (1280px): two-column layout unchanged

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(mobile): address build/test issues from mobile primitives"
```
