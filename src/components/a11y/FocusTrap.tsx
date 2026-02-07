"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FocusTrapProps {
  /** Content to trap focus within */
  children: ReactNode;
  /** Whether the focus trap is active */
  active: boolean;
  /** Callback when user attempts to escape (e.g., pressing Escape) */
  onEscape?: () => void;
  /** Element to return focus to when trap is deactivated */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Traps keyboard focus within a container, essential for modal dialogs.
 * Handles Tab/Shift+Tab cycling and Escape key.
 * Returns focus to the triggering element when deactivated.
 *
 * @example
 * const triggerRef = useRef<HTMLButtonElement>(null);
 * <button ref={triggerRef} onClick={() => setOpen(true)}>Open Modal</button>
 * <FocusTrap active={open} onEscape={() => setOpen(false)} returnFocusRef={triggerRef}>
 *   <dialog>...</dialog>
 * </FocusTrap>
 */
export function FocusTrap({
  children,
  active,
  onEscape,
  returnFocusRef,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store the currently focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the trap
    const container = containerRef.current;
    if (container) {
      const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
      const firstElement = focusableElements[0];
      if (firstElement) {
        firstElement.focus();
      }
    }

    return () => {
      // Return focus when trap is deactivated
      const returnTarget = returnFocusRef?.current || previousActiveElementRef.current;
      if (returnTarget && typeof returnTarget.focus === "function") {
        returnTarget.focus();
      }
    };
  }, [active, returnFocusRef]);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Handle Escape key
      if (event.key === "Escape" && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab key for focus cycling
      if (event.key === "Tab") {
        const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Guard against undefined elements
        if (!firstElement || !lastElement) return;

        if (event.shiftKey) {
          // Shift + Tab: cycle backwards
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: cycle forwards
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);

  if (!active) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} data-focus-trap="active">
      {children}
    </div>
  );
}
