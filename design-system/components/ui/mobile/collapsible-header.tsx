"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useScrollDirection } from "@/src/hooks/useScrollDirection";

interface CollapsibleHeaderProps {
  title: string;
  collapsedTitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

const SPRING_CONFIG = { stiffness: 300, damping: 25 };
const EXPAND_SCROLL_THRESHOLD = 100;

/**
 * iOS-style large title header that collapses to compact on scroll down.
 * Re-expands on scroll up when near top of content.
 */
export function CollapsibleHeader({
  title,
  collapsedTitle,
  actions,
  children,
  className,
}: CollapsibleHeaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const scrollDirection = useScrollDirection({ targetRef: contentRef });

  // Collapse/expand in useEffect to avoid setState during render
  useEffect(() => {
    const scrollTop = contentRef.current?.scrollTop ?? 0;

    if (scrollDirection === "down" && !collapsed) {
      setCollapsed(true);
    } else if (scrollDirection === "up" && collapsed && scrollTop < EXPAND_SCROLL_THRESHOLD) {
      setCollapsed(false);
    }
  }, [scrollDirection, collapsed]);

  return (
    <div className={`flex h-full flex-col ${className ?? ""}`}>
      {/* Header */}
      <motion.div
        className="border-synapse-2 bg-backbone-1 sticky top-0 z-10 flex items-center border-b px-4"
        animate={{
          height: collapsed ? 48 : 80,
        }}
        transition={{ type: "spring", ...SPRING_CONFIG }}
      >
        <motion.h1
          className="text-synapse-7 flex-1"
          animate={{
            fontSize: collapsed ? "16px" : "24px",
            fontWeight: collapsed ? 600 : 700,
          }}
          transition={{ type: "spring", ...SPRING_CONFIG }}
        >
          {collapsed ? (collapsedTitle ?? title) : title}
        </motion.h1>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </motion.div>

      {/* Scrollable content */}
      <div
        ref={contentRef}
        className="min-h-0 flex-1 overflow-y-auto"
        style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </div>
  );
}
