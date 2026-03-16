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
