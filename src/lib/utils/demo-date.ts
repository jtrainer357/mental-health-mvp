/**
 * Demo Date Utility
 * All dates are now relative to today so the prototype always looks fresh.
 */

import { today, todayDate, daysFromNow, demoNow } from "@/src/lib/data/helpers";

export { demoNow };

// "Today" — always the real current date
export const DEMO_DATE = today();
export const DEMO_DATE_OBJECT = todayDate();

// Demo practice ID (used across all queries)
export const DEMO_PRACTICE_ID = "550e8400-e29b-41d4-a716-446655440000";

/**
 * Get the demo "today" date string in YYYY-MM-DD format
 */
export function getDemoToday(): string {
  return today();
}

/**
 * Get the demo "today" as a Date object
 */
export function getDemoTodayDate(): Date {
  return todayDate();
}

/**
 * Get a date N days from demo date in YYYY-MM-DD format
 */
export function getDemoDaysFromNow(days: number): string {
  return daysFromNow(days);
}

/**
 * Get a date N days before demo date in YYYY-MM-DD format
 */
export function getDemoDaysAgo(days: number): string {
  return daysFromNow(-days);
}

/**
 * Format a date for display (e.g., "Monday, Mar 25")
 */
export function formatDemoDate(format: "long" | "short" = "long"): string {
  const d = todayDate();
  if (format === "long") {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
