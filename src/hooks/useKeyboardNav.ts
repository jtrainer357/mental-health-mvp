"use client";

import type { KeyboardEvent } from "react";

interface KeyboardNavOptions {
  /** Callback to execute on selection (Enter or Space) */
  onSelect: () => void;
  /** Optional callback for arrow key navigation */
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  /** Whether the element is disabled */
  disabled?: boolean;
}

/**
 * Hook that provides keyboard navigation props for custom interactive elements.
 * Use this when creating clickable elements that aren't native buttons or links.
 *
 * @example
 * function Card({ onClick }: { onClick: () => void }) {
 *   const keyboardProps = useKeyboardNav({ onSelect: onClick });
 *   return (
 *     <div onClick={onClick} {...keyboardProps}>
 *       Card content
 *     </div>
 *   );
 * }
 */
export function useKeyboardNav({
  onSelect,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  disabled = false,
}: KeyboardNavOptions) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        onSelect();
        break;
      case "ArrowUp":
        if (onArrowUp) {
          e.preventDefault();
          onArrowUp();
        }
        break;
      case "ArrowDown":
        if (onArrowDown) {
          e.preventDefault();
          onArrowDown();
        }
        break;
      case "ArrowLeft":
        if (onArrowLeft) {
          e.preventDefault();
          onArrowLeft();
        }
        break;
      case "ArrowRight":
        if (onArrowRight) {
          e.preventDefault();
          onArrowRight();
        }
        break;
    }
  };

  return {
    tabIndex: disabled ? -1 : 0,
    role: "button" as const,
    "aria-disabled": disabled || undefined,
    onKeyDown: handleKeyDown,
  };
}
