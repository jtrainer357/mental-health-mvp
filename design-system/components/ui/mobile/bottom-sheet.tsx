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
 * Accessible: focus trap, Escape to close, ARIA dialog, focus restoration.
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

  // Store focus + lock body scroll
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
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
    requestAnimationFrame(() => {
      sheetRef.current?.focus();
    });

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Drag handling via swipe gesture
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
            {/* Drag handle - 44px touch target */}
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
