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

  it("defaults to false for mobile/tablet/touch when no query matches (SSR-safe)", () => {
    // Simulate SSR / no-match environment: all matchMedia queries return false
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
    // When no viewport query matches, mobile and touch should be false.
    // isDesktop is derived as !isMobile && !isTablet so it will be true after mount.
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isTouchDevice).toBe(false);
  });
});
