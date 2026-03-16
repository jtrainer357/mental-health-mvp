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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const tabletQuery = window.matchMedia(TABLET_QUERY);

    const update = () => {
      setIsMobile(mobileQuery.matches);
      setIsTablet(tabletQuery.matches);
    };

    update();
    setMounted(true);

    mobileQuery.addEventListener("change", update);
    tabletQuery.addEventListener("change", update);

    return () => {
      mobileQuery.removeEventListener("change", update);
      tabletQuery.removeEventListener("change", update);
    };
  }, []);

  // isDesktop is the logical complement of mobile/tablet, derived after mount.
  // Before mount (SSR), isMobile and isTablet are false, so isDesktop would be true.
  // We gate on mounted to keep all values false during SSR / pre-hydration.
  const isDesktop = mounted ? !isMobile && !isTablet : false;
  const isTouchDevice = isMobile || isTablet;

  return { isMobile, isTablet, isDesktop, isTouchDevice };
}
