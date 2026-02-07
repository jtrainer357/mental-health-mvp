"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, type ReactNode } from "react";

interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Function to render each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Estimated size of each item in pixels */
  estimateSize: number;
  /** Number of items to render outside the visible area */
  overscan?: number;
  /** Optional className for the scroll container */
  className?: string;
  /** Height of the scroll container (required for virtualization) */
  height?: number | string;
  /** Optional gap between items in pixels */
  gap?: number;
  /** Accessible label for the list */
  "aria-label"?: string;
  /** Role for the list container */
  role?: "list" | "listbox" | "grid";
}

/**
 * Virtualized list component for efficiently rendering large lists.
 * Only renders items that are visible in the viewport plus overscan.
 *
 * @example
 * <VirtualList
 *   items={patients}
 *   estimateSize={80}
 *   height={600}
 *   renderItem={(patient) => (
 *     <PatientCard key={patient.id} patient={patient} />
 *   )}
 * />
 */
export function VirtualList<T>({
  items,
  renderItem,
  estimateSize,
  overscan = 5,
  className = "",
  height = 400,
  gap = 0,
  "aria-label": ariaLabel,
  role = "list",
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    gap,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      role={role}
      aria-label={ariaLabel}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          // Guard against undefined items (shouldn't happen but TypeScript requires it)
          if (item === undefined) return null;
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
              role={role === "list" ? "listitem" : undefined}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Hook version for more complex virtualization needs.
 * Provides direct access to the virtualizer instance.
 */
export function useVirtualList<T>(
  items: T[],
  options: {
    parentRef: React.RefObject<HTMLElement | null>;
    estimateSize: number;
    overscan?: number;
    gap?: number;
  }
) {
  return useVirtualizer({
    count: items.length,
    getScrollElement: () => options.parentRef.current,
    estimateSize: () => options.estimateSize,
    overscan: options.overscan ?? 5,
    gap: options.gap,
  });
}
