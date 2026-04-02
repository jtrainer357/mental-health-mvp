/**
 * Data Helpers — Date computation and lookup utilities
 * All dates are relative to today so the prototype always looks fresh.
 */

import type { SeedPatient } from "./types";

// ============================================================================
// DATE HELPERS
// ============================================================================

/**
 * Frozen demo date: Thursday April 3, 2026 at 8:40 AM
 * Set for user testing sessions. Change to `null` to use real current date.
 */
const FROZEN_DEMO_DATE = new Date(2026, 3, 2, 8, 40, 0, 0); // Thu Apr 2, 2026 8:40 AM (month 0-indexed)

/** Returns the frozen demo "now" (with time), or real Date if unfrozen */
export function demoNow(): Date {
  return FROZEN_DEMO_DATE ? new Date(FROZEN_DEMO_DATE) : new Date();
}

/** Returns today's date as YYYY-MM-DD (local time, not UTC) */
export function today(): string {
  const d = FROZEN_DEMO_DATE ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Returns a Date object for today at noon (avoids timezone edge cases) */
export function todayDate(): Date {
  const d = FROZEN_DEMO_DATE ? new Date(FROZEN_DEMO_DATE) : new Date();
  d.setHours(12, 0, 0, 0);
  return d;
}

/** Returns date N days from today as YYYY-MM-DD */
export function daysFromNow(n: number): string {
  const d = todayDate();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0]!;
}

/** Returns date N weeks ago as YYYY-MM-DD */
export function weeksAgo(n: number): string {
  return daysFromNow(-n * 7);
}

/**
 * Generate 4 weekly appointment dates (weeks -4 through -1) for a patient's
 * preferred weekday. Returns dates in chronological order (oldest first).
 */
export function weeklyHistoryDates(preferredDay: number): string[] {
  const dates: string[] = [];
  for (let w = 4; w >= 1; w--) {
    const d = todayDate();
    d.setDate(d.getDate() - w * 7);
    // Adjust to the patient's preferred weekday
    const currentDay = d.getDay();
    const diff = preferredDay - currentDay;
    d.setDate(d.getDate() + diff);
    dates.push(d.toISOString().split("T")[0]!);
  }
  return dates;
}

/**
 * Generate a future appointment date (next occurrence of preferred weekday)
 */
export function nextAppointmentDate(preferredDay: number, weeksAhead: number = 1): string {
  const d = todayDate();
  // Find next occurrence of preferred day
  const currentDay = d.getDay();
  let daysUntil = preferredDay - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  d.setDate(d.getDate() + daysUntil + (weeksAhead - 1) * 7);
  return d.toISOString().split("T")[0]!;
}

/**
 * Compute end time from start time + duration
 */
export function computeEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const totalMinutes = h! * 60 + m! + durationMinutes;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

/**
 * Format a date string for display in timestamps (ISO format)
 */
export function toISO(dateStr: string, time: string = "12:00:00"): string {
  return `${dateStr}T${time}Z`;
}

/**
 * Get the date for a specific weekday in the current week.
 * 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 */
export function thisWeekDay(dayOfWeek: number): string {
  const d = todayDate();
  const currentDay = d.getDay();
  const diff = dayOfWeek - currentDay;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0]!;
}

/**
 * Get a future date N weeks from a given weekday's current-week occurrence.
 */
export function futureWeekDate(preferredDay: number, weeksAhead: number): string {
  const base = thisWeekDay(preferredDay);
  const d = new Date(base + "T12:00:00");
  d.setDate(d.getDate() + weeksAhead * 7);
  return d.toISOString().split("T")[0]!;
}

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

let _patientMap: Map<string, SeedPatient> | null = null;

/** Lazy-initialize patient lookup map */
export function initPatientMap(patients: SeedPatient[]): void {
  _patientMap = new Map(patients.map((p) => [p.id, p]));
}

/** Get patient by ID — throws if not found (catches inconsistencies early) */
export function getPatientById(id: string): SeedPatient {
  if (!_patientMap) {
    throw new Error("Patient map not initialized. Call initPatientMap() first.");
  }
  const p = _patientMap.get(id);
  if (!p) {
    throw new Error(`Patient not found: ${id}. Check data consistency.`);
  }
  return p;
}

/** Get patient full name */
export function patientName(p: SeedPatient): string {
  return `${p.first_name} ${p.last_name}`;
}
