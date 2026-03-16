"use client";

import { useState, useEffect, useRef } from "react";

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
 *
 * Uses refs for all gesture state accessed inside event handlers so listeners
 * do not need to be re-attached on every touch move. The useEffect dependency
 * array is [threshold, edgeZone, directionLock].
 *
 * The returned `ref` uses a custom setter so direct `.current = el` assignments
 * (common in tests) immediately attach listeners without a React re-render cycle.
 */
export function useSwipeGesture(options: SwipeGestureOptions = {}): SwipeGestureResult {
  const { threshold = 50, edgeZone, direction: directionLock = "both", onSwipe } = options;

  const [state, setState] = useState<{
    swiping: boolean;
    direction: "left" | "right" | "up" | "down" | null;
    distance: number;
    velocity: number;
  }>({ swiping: false, direction: null, distance: 0, velocity: 0 });

  // Gesture tracking refs — accessed inside event handlers, never in the dep array
  const startPoint = useRef<TouchPoint | null>(null);
  const recentPoints = useRef<TouchPoint[]>([]);
  const lockedDirection = useRef<"horizontal" | "vertical" | null>(null);
  const inEdgeZone = useRef(false);
  const currentDistance = useRef(0);
  const currentDirection = useRef<"left" | "right" | "up" | "down" | null>(null);

  // Option refs — updated on every render so handlers always see latest values
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;
  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold;
  const edgeZoneRef = useRef(edgeZone);
  edgeZoneRef.current = edgeZone;
  const directionLockRef = useRef(directionLock);
  directionLockRef.current = directionLock;

  // Stable handler refs so we can add/remove the same function identity
  const handlersRef = useRef<{
    start: ((e: TouchEvent) => void) | null;
    move: ((e: TouchEvent) => void) | null;
    end: ((e: TouchEvent) => void) | null;
  }>({ start: null, move: null, end: null });

  // Custom ref with setter that immediately attaches/detaches listeners
  const currentElRef = useRef<HTMLElement | null>(null);
  const ref = useRef<{ current: HTMLElement | null }>({
    get current() {
      return currentElRef.current;
    },
    set current(el: HTMLElement | null) {
      const prev = currentElRef.current;
      currentElRef.current = el;

      // Detach from previous element
      if (prev && handlersRef.current.start) {
        prev.removeEventListener("touchstart", handlersRef.current.start);
        prev.removeEventListener("touchmove", handlersRef.current.move!);
        prev.removeEventListener("touchend", handlersRef.current.end!);
      }

      // Attach to new element immediately (synchronously)
      if (el && handlersRef.current.start) {
        el.addEventListener("touchstart", handlersRef.current.start, { passive: true });
        el.addEventListener("touchmove", handlersRef.current.move!, { passive: true });
        el.addEventListener("touchend", handlersRef.current.end!, { passive: true });
      }
    },
  });

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      const ez = edgeZoneRef.current;
      if (ez !== undefined && touch.clientX > ez) {
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

      const ez = edgeZoneRef.current;
      if (ez !== undefined && !inEdgeZone.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      const dl = directionLockRef.current;
      const dx = touch.clientX - startPoint.current.x;
      const dy = touch.clientY - startPoint.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Lock direction after 10px of movement
      if (!lockedDirection.current && (absDx > 10 || absDy > 10)) {
        lockedDirection.current = absDx > absDy ? "horizontal" : "vertical";
      }

      // Honour direction constraint
      if (dl === "horizontal" && lockedDirection.current === "vertical") return;
      if (dl === "vertical" && lockedDirection.current === "horizontal") return;

      let swipeDir: "left" | "right" | "up" | "down";
      let dist: number;

      if (lockedDirection.current === "horizontal" || absDx >= absDy) {
        swipeDir = dx > 0 ? "right" : "left";
        dist = absDx;
      } else {
        swipeDir = dy > 0 ? "down" : "up";
        dist = absDy;
      }

      currentDistance.current = dist;
      currentDirection.current = swipeDir;

      const now = Date.now();
      recentPoints.current.push({ x: touch.clientX, y: touch.clientY, time: now });
      if (recentPoints.current.length > 3) recentPoints.current.shift();

      let vel = 0;
      const pts = recentPoints.current;
      if (pts.length >= 2) {
        const first = pts[0]!;
        const last = pts[pts.length - 1]!;
        const timeDelta = last.time - first.time;
        if (timeDelta > 0) {
          vel = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2) / timeDelta;
        }
      }

      setState({ swiping: true, direction: swipeDir, distance: dist, velocity: vel });
    };

    const handleTouchEnd = () => {
      if (!startPoint.current) return;

      const ez = edgeZoneRef.current;
      if (ez !== undefined && !inEdgeZone.current) {
        setState({ swiping: false, direction: null, distance: 0, velocity: 0 });
        startPoint.current = null;
        return;
      }

      if (
        currentDistance.current >= thresholdRef.current &&
        currentDirection.current &&
        onSwipeRef.current
      ) {
        onSwipeRef.current(currentDirection.current);
      }

      setState({ swiping: false, direction: null, distance: 0, velocity: 0 });
      startPoint.current = null;
      recentPoints.current = [];
      lockedDirection.current = null;
      inEdgeZone.current = false;
    };

    // Store handlers so the custom ref setter can attach/detach them
    handlersRef.current = {
      start: handleTouchStart,
      move: handleTouchMove,
      end: handleTouchEnd,
    };

    // Attach to the current element (if already set)
    const el = currentElRef.current;
    if (el) {
      el.addEventListener("touchstart", handleTouchStart, { passive: true });
      el.addEventListener("touchmove", handleTouchMove, { passive: true });
      el.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    return () => {
      if (el) {
        el.removeEventListener("touchstart", handleTouchStart);
        el.removeEventListener("touchmove", handleTouchMove);
        el.removeEventListener("touchend", handleTouchEnd);
      }
      handlersRef.current = { start: null, move: null, end: null };
    };
  }, [threshold, edgeZone, directionLock]);

  const progress = threshold > 0 ? Math.min(state.distance / threshold, 1) : 0;

  return {
    ref: ref.current as unknown as React.RefObject<HTMLElement | null>,
    ...state,
    progress,
  };
}
