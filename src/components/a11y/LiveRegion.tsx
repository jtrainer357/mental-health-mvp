"use client";

import { useEffect, useRef, useState } from "react";

type Priority = "polite" | "assertive";

interface LiveRegionProps {
  /** The message to announce to screen readers */
  message: string;
  /** Priority level - 'polite' waits for user idle, 'assertive' interrupts */
  priority?: Priority;
  /** Optional className for styling (usually visually hidden) */
  className?: string;
}

/**
 * Announces dynamic content changes to screen readers.
 * Uses ARIA live regions to communicate updates without focus change.
 *
 * @example
 * <LiveRegion message="Form submitted successfully" priority="polite" />
 * <LiveRegion message="Error: Invalid email" priority="assertive" />
 */
export function LiveRegion({
  message,
  priority = "polite",
  className = "sr-only",
}: LiveRegionProps) {
  // Use a key to force re-render and re-announce same messages
  const [key, setKey] = useState(0);
  const prevMessageRef = useRef(message);

  useEffect(() => {
    if (message !== prevMessageRef.current) {
      setKey((k) => k + 1);
      prevMessageRef.current = message;
    }
  }, [message]);

  return (
    <div
      key={key}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className={className}
    >
      {message}
    </div>
  );
}

/**
 * Hook for programmatically announcing messages to screen readers.
 * Returns a function that can be called to make announcements.
 *
 * @example
 * const announce = useAnnounce();
 * announce("Item added to cart", "polite");
 */
export function useAnnounce() {
  const [announcement, setAnnouncement] = useState<{
    message: string;
    priority: Priority;
  }>({ message: "", priority: "polite" });

  const announce = (message: string, priority: Priority = "polite") => {
    setAnnouncement({ message, priority });
  };

  return { announce, announcement };
}
