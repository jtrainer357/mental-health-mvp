"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SwipeBack } from "./swipe-back";

interface MobileNavStackProps {
  showDetail: boolean;
  onBack?: () => void;
  listView: ReactNode;
  detailView: ReactNode;
  enableSwipeBack?: boolean;
  className?: string;
}

const SLIDE_EASING = [0.25, 0.1, 0.25, 1.0] as const;
const SLIDE_DURATION = 0.25;

/**
 * Generic push/pop mobile navigation container.
 * Shows listView or detailView with iOS-style slide transitions.
 * Consumers should guard rendering with useMobileDetect().isTouchDevice.
 */
export function MobileNavStack({
  showDetail,
  onBack,
  listView,
  detailView,
  enableSwipeBack = true,
  className,
}: MobileNavStackProps) {
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className ?? ""}`}>
      <AnimatePresence mode="wait" initial={false}>
        {!showDetail ? (
          <motion.div
            key="list"
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{
              duration: SLIDE_DURATION,
              ease: SLIDE_EASING as [number, number, number, number],
            }}
            className="flex flex-1 flex-col"
          >
            {listView}
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{
              duration: SLIDE_DURATION,
              ease: SLIDE_EASING as [number, number, number, number],
            }}
            className="flex flex-1 flex-col"
          >
            {enableSwipeBack && onBack ? (
              <SwipeBack onBack={onBack}>{detailView}</SwipeBack>
            ) : (
              detailView
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
