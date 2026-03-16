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
