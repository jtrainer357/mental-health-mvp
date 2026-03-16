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
