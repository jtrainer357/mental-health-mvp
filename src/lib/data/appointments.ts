/**
 * Seed Appointments — Generated from patient schedule preferences
 * All dates are relative to today so the prototype always looks fresh.
 *
 * Schedule distribution (Mon–Fri, no overlaps):
 *   Mon: carmen-alvarez 09:00, sarah-johnson 10:00, natalie-kim 11:00,
 *        derek-washington 13:00, aaliyah-brooks 14:00
 *   Tue: rachel-torres 09:00, james-okafor 10:00, sophia-chen 13:00,
 *        marcus-washington 14:00
 *   Wed: emma-kowalski 09:00, maria-rodriguez 10:00, tyler-harrison 11:00,
 *        priya-sharma 14:00, jasmine-williams 15:00
 *   Thu: robert-fitzgerald 09:00, lisa-whitfield 10:00, david-nakamura 11:00,
 *        benjamin-cole 14:00, omar-hassan 15:00
 *   Fri: daniel-park 09:00, kevin-rhodes 10:00, river-chen 11:00,
 *        michael-chen 14:00
 */

import type { SeedAppointment } from "./types";
import { PATIENTS } from "./patients";
import {
  todayDate,
  weeklyHistoryDates,
  computeEndTime,
  patientName,
  weeksAgo,
  thisWeekDay,
  futureWeekDate,
} from "./helpers";

// ============================================================================
// HELPER
// ============================================================================

function serviceType(cpt: string): string {
  return cpt === "90791" ? "Initial Evaluation" : "Individual Therapy";
}

function apt(
  patientId: string,
  index: number,
  date: string,
  startTime: string,
  duration: number,
  cpt: string,
  status: SeedAppointment["status"],
  notes?: string
): SeedAppointment {
  const p = PATIENTS.find((p) => p.id === patientId)!;
  return {
    id: `apt-${patientId}-${index}`,
    patient_id: patientId,
    patient_name: patientName(p),
    date,
    start_time: startTime,
    end_time: computeEndTime(startTime, duration),
    duration_minutes: duration,
    status,
    service_type: serviceType(cpt),
    cpt_code: cpt,
    location: "Main Office",
    ...(notes ? { notes } : {}),
  };
}

// ============================================================================
// APPOINTMENTS
// ============================================================================

const allAppointments: SeedAppointment[] = [];
const todayDow = todayDate().getDay(); // 0=Sun … 6=Sat

// ── ACTIVE PATIENTS WITH RECURRING WEEKLY APPOINTMENTS ──────────────────────
// Generates: 4 weeks past (completed) + this week + 4 weeks future (scheduled)

const SKIP_IDS = new Set([
  "tyler-harrison", // new patient — handled separately
  "derek-washington", // no-show pattern — handled separately
  "margaret-williams", // inactive
  "thomas-reed", // inactive
]);

for (const p of PATIENTS) {
  if (SKIP_IDS.has(p.id) || p.preferred_day === 0 || p.status === "Inactive") continue;

  let idx = 0;

  // Past 4 weeks — all completed
  const hist = weeklyHistoryDates(p.preferred_day);
  for (const d of hist) {
    idx++;
    allAppointments.push(
      apt(p.id, idx, d, p.preferred_time, p.session_duration, p.cpt_code, "Completed")
    );
  }

  // This week — completed if day has passed, scheduled if today or upcoming
  const thisWeekDate = thisWeekDay(p.preferred_day);
  idx++;
  const thisWeekStatus: SeedAppointment["status"] =
    p.preferred_day < todayDow ? "Completed" : "Scheduled";
  allAppointments.push(
    apt(p.id, idx, thisWeekDate, p.preferred_time, p.session_duration, p.cpt_code, thisWeekStatus)
  );

  // Next 4 weeks — all scheduled
  for (let w = 1; w <= 4; w++) {
    idx++;
    allAppointments.push(
      apt(
        p.id,
        idx,
        futureWeekDate(p.preferred_day, w),
        p.preferred_time,
        p.session_duration,
        p.cpt_code,
        "Scheduled"
      )
    );
  }
}

// ── TYLER HARRISON — New patient, initial evaluation this week ──────────────
(() => {
  const p = PATIENTS.find((pt) => pt.id === "tyler-harrison")!;
  const thisWeekDate = thisWeekDay(p.preferred_day);
  const thisWeekStatus: SeedAppointment["status"] =
    p.preferred_day < todayDow ? "Completed" : "Scheduled";

  // Initial eval this week
  allAppointments.push(
    apt(p.id, 1, thisWeekDate, p.preferred_time, p.session_duration, "90791", thisWeekStatus)
  );

  // Future weeks — switches to regular therapy (90837)
  for (let w = 1; w <= 4; w++) {
    allAppointments.push(
      apt(
        p.id,
        w + 1,
        futureWeekDate(p.preferred_day, w),
        p.preferred_time,
        p.session_duration,
        "90837",
        "Scheduled"
      )
    );
  }
})();

// ── DEREK WASHINGTON — Chronic no-show pattern ──────────────────────────────
(() => {
  const p = PATIENTS.find((pt) => pt.id === "derek-washington")!;
  const hist = weeklyHistoryDates(p.preferred_day);

  // Week -4: Completed
  allAppointments.push(
    apt(p.id, 1, hist[0]!, p.preferred_time, p.session_duration, p.cpt_code, "Completed")
  );
  // Week -3: No-Show
  allAppointments.push(
    apt(p.id, 2, hist[1]!, p.preferred_time, p.session_duration, p.cpt_code, "No-Show")
  );
  // Week -2: Completed
  allAppointments.push(
    apt(p.id, 3, hist[2]!, p.preferred_time, p.session_duration, p.cpt_code, "Completed")
  );
  // Week -1: No-Show
  allAppointments.push(
    apt(p.id, 4, hist[3]!, p.preferred_time, p.session_duration, p.cpt_code, "No-Show")
  );
  // This week: scheduled (provider hopes he shows up)
  const thisWeekDate = thisWeekDay(p.preferred_day);
  const thisWeekStatus: SeedAppointment["status"] =
    p.preferred_day < todayDow ? "Completed" : "Scheduled";
  allAppointments.push(
    apt(p.id, 5, thisWeekDate, p.preferred_time, p.session_duration, p.cpt_code, thisWeekStatus)
  );
  // Next 2 weeks
  for (let w = 1; w <= 2; w++) {
    allAppointments.push(
      apt(
        p.id,
        5 + w,
        futureWeekDate(p.preferred_day, w),
        p.preferred_time,
        p.session_duration,
        p.cpt_code,
        "Scheduled"
      )
    );
  }
})();

// ── INACTIVE / DISCHARGED — old appointments only ───────────────────────────

// Margaret Williams: 4 old appointments (8–11 weeks ago)
(() => {
  const p = PATIENTS.find((pt) => pt.id === "margaret-williams")!;
  for (let i = 0; i < 4; i++) {
    allAppointments.push(
      apt(p.id, i + 1, weeksAgo(11 - i), "10:00", p.session_duration, p.cpt_code, "Completed")
    );
  }
})();

// Thomas Reed: 3 old appointments (9–11 weeks ago)
(() => {
  const p = PATIENTS.find((pt) => pt.id === "thomas-reed")!;
  for (let i = 0; i < 3; i++) {
    allAppointments.push(
      apt(p.id, i + 1, weeksAgo(11 - i), "14:00", p.session_duration, p.cpt_code, "Completed")
    );
  }
})();

// ── CANCELLATIONS (visible in schedule week 2) ─────────────────────────────

// Kevin Rhodes — cancelled week 2 session
(() => {
  const p = PATIENTS.find((pt) => pt.id === "kevin-rhodes")!;
  allAppointments.push(
    apt(
      p.id,
      20,
      futureWeekDate(p.preferred_day, 2),
      p.preferred_time,
      p.session_duration,
      p.cpt_code,
      "Cancelled",
      "Patient cancelled same-day via text"
    )
  );
})();

// Sarah Johnson — cancelled week 2 session (reschedule requested)
(() => {
  const p = PATIENTS.find((pt) => pt.id === "sarah-johnson")!;
  allAppointments.push(
    apt(
      p.id,
      20,
      futureWeekDate(p.preferred_day, 2),
      p.preferred_time,
      p.session_duration,
      p.cpt_code,
      "Cancelled",
      "Reschedule requested — needs new time"
    )
  );
})();

// ============================================================================
// EXPORT
// ============================================================================

export const APPOINTMENTS: SeedAppointment[] = allAppointments;
