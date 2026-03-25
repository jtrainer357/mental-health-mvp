/**
 * Seed Appointments — Generated from patient schedule preferences
 * All dates are relative to today so the prototype always looks fresh.
 */

import type { SeedAppointment } from "./types";
import { PATIENTS } from "./patients";
import {
  today,
  weeklyHistoryDates,
  nextAppointmentDate,
  computeEndTime,
  patientName,
  daysFromNow,
  weeksAgo,
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

// ── TODAY'S SCHEDULE ────────────────────────────────────────────────────────
// rachel-torres: 4 past + today + 1 future
(() => {
  const p = PATIENTS.find((p) => p.id === "rachel-torres")!;
  const hist = weeklyHistoryDates(p.preferred_day);
  hist.forEach((d, i) =>
    allAppointments.push(
      apt(p.id, i + 1, d, p.preferred_time, p.session_duration, p.cpt_code, "Completed")
    )
  );
  allAppointments.push(apt(p.id, 5, today(), "09:00", p.session_duration, p.cpt_code, "Scheduled"));
  allAppointments.push(
    apt(
      p.id,
      6,
      nextAppointmentDate(p.preferred_day),
      p.preferred_time,
      p.session_duration,
      p.cpt_code,
      "Scheduled"
    )
  );
})();

// james-okafor: 4 past + today + 1 future
(() => {
  const p = PATIENTS.find((p) => p.id === "james-okafor")!;
  const hist = weeklyHistoryDates(p.preferred_day);
  hist.forEach((d, i) =>
    allAppointments.push(
      apt(p.id, i + 1, d, p.preferred_time, p.session_duration, p.cpt_code, "Completed")
    )
  );
  allAppointments.push(apt(p.id, 5, today(), "10:30", p.session_duration, p.cpt_code, "Scheduled"));
  allAppointments.push(
    apt(
      p.id,
      6,
      nextAppointmentDate(p.preferred_day),
      p.preferred_time,
      p.session_duration,
      p.cpt_code,
      "Scheduled"
    )
  );
})();

// sophia-chen: 4 past + today + 1 future
(() => {
  const p = PATIENTS.find((p) => p.id === "sophia-chen")!;
  const hist = weeklyHistoryDates(p.preferred_day);
  hist.forEach((d, i) =>
    allAppointments.push(
      apt(p.id, i + 1, d, p.preferred_time, p.session_duration, p.cpt_code, "Completed")
    )
  );
  allAppointments.push(apt(p.id, 5, today(), "13:00", p.session_duration, p.cpt_code, "Scheduled"));
  allAppointments.push(
    apt(
      p.id,
      6,
      nextAppointmentDate(p.preferred_day),
      p.preferred_time,
      p.session_duration,
      p.cpt_code,
      "Scheduled"
    )
  );
})();

// marcus-washington: 4 past + today + 1 future
(() => {
  const p = PATIENTS.find((p) => p.id === "marcus-washington")!;
  const hist = weeklyHistoryDates(p.preferred_day);
  hist.forEach((d, i) =>
    allAppointments.push(
      apt(p.id, i + 1, d, p.preferred_time, p.session_duration, p.cpt_code, "Completed")
    )
  );
  allAppointments.push(apt(p.id, 5, today(), "15:30", p.session_duration, p.cpt_code, "Scheduled"));
  allAppointments.push(
    apt(
      p.id,
      6,
      nextAppointmentDate(p.preferred_day),
      p.preferred_time,
      p.session_duration,
      p.cpt_code,
      "Scheduled"
    )
  );
})();

// tyler-harrison: NEW patient — only 1 appointment today (initial eval)
(() => {
  allAppointments.push(apt("tyler-harrison", 1, today(), "14:30", 60, "90791", "Scheduled"));
})();

// lisa-whitfield: 4 past + today + 1 future
(() => {
  const p = PATIENTS.find((p) => p.id === "lisa-whitfield")!;
  const hist = weeklyHistoryDates(p.preferred_day);
  hist.forEach((d, i) =>
    allAppointments.push(
      apt(p.id, i + 1, d, p.preferred_time, p.session_duration, p.cpt_code, "Completed")
    )
  );
  allAppointments.push(apt(p.id, 5, today(), "11:30", p.session_duration, p.cpt_code, "Scheduled"));
  allAppointments.push(
    apt(
      p.id,
      6,
      nextAppointmentDate(p.preferred_day),
      p.preferred_time,
      p.session_duration,
      p.cpt_code,
      "Scheduled"
    )
  );
})();

// ── RICH HISTORY (10 patients) — 4 past + 1 future ─────────────────────────

for (const pid of [
  "emma-kowalski",
  "david-nakamura",
  "carmen-alvarez",
  "kevin-rhodes",
  "priya-sharma",
  "robert-fitzgerald",
  "aaliyah-brooks",
  "daniel-park",
  "maria-rodriguez",
  "benjamin-cole",
]) {
  const p = PATIENTS.find((pt) => pt.id === pid)!;
  const hist = weeklyHistoryDates(p.preferred_day);
  hist.forEach((d, i) =>
    allAppointments.push(
      apt(p.id, i + 1, d, p.preferred_time, p.session_duration, p.cpt_code, "Completed")
    )
  );
  allAppointments.push(
    apt(
      p.id,
      5,
      nextAppointmentDate(p.preferred_day),
      p.preferred_time,
      p.session_duration,
      p.cpt_code,
      "Scheduled"
    )
  );
}

// ── LIGHT HISTORY (5 patients) — 2-3 past + 1 future ───────────────────────

for (const pid of [
  "sarah-johnson",
  "michael-chen",
  "jasmine-williams",
  "omar-hassan",
  "natalie-kim",
]) {
  const p = PATIENTS.find((pt) => pt.id === pid)!;
  const hist = weeklyHistoryDates(p.preferred_day);
  // Take only the last 2-3 history dates (skip oldest)
  const recentHist =
    pid === "jasmine-williams" || pid === "natalie-kim" ? hist.slice(2) : hist.slice(1);
  recentHist.forEach((d, i) =>
    allAppointments.push(
      apt(p.id, i + 1, d, p.preferred_time, p.session_duration, p.cpt_code, "Completed")
    )
  );
  allAppointments.push(
    apt(
      p.id,
      recentHist.length + 1,
      nextAppointmentDate(p.preferred_day),
      p.preferred_time,
      p.session_duration,
      p.cpt_code,
      "Scheduled"
    )
  );
}

// ── INACTIVE / DISCHARGED — old appointments, all completed ─────────────────

// margaret-williams: 4 old appointments (8-11 weeks ago)
(() => {
  const p = PATIENTS.find((pt) => pt.id === "margaret-williams")!;
  for (let i = 0; i < 4; i++) {
    allAppointments.push(
      apt(p.id, i + 1, weeksAgo(11 - i), "10:00", p.session_duration, p.cpt_code, "Completed")
    );
  }
})();

// thomas-reed: 3 old appointments (9-11 weeks ago)
(() => {
  const p = PATIENTS.find((pt) => pt.id === "thomas-reed")!;
  for (let i = 0; i < 3; i++) {
    allAppointments.push(
      apt(p.id, i + 1, weeksAgo(11 - i), "14:00", p.session_duration, p.cpt_code, "Completed")
    );
  }
})();

// ── CHRONIC NO-SHOW — derek-washington: 4 appointments, 2 completed, 2 no-show
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
})();

// ── RIVER CHEN — 4 past + 1 future (rich history level) ────────────────────
(() => {
  const p = PATIENTS.find((pt) => pt.id === "river-chen")!;
  const hist = weeklyHistoryDates(p.preferred_day);
  hist.forEach((d, i) =>
    allAppointments.push(
      apt(p.id, i + 1, d, p.preferred_time, p.session_duration, p.cpt_code, "Completed")
    )
  );
  allAppointments.push(
    apt(
      p.id,
      5,
      nextAppointmentDate(p.preferred_day),
      p.preferred_time,
      p.session_duration,
      p.cpt_code,
      "Scheduled"
    )
  );
})();

// ── NEXT-WEEK CANCELLATIONS (visible in schedule alerts) ─────────────────────
// Kevin Rhodes — cancelled next week's session (same-day cancel pattern)
(() => {
  const p = PATIENTS.find((pt) => pt.id === "kevin-rhodes")!;
  allAppointments.push(
    apt(
      p.id,
      10,
      nextAppointmentDate(p.preferred_day),
      p.preferred_time,
      p.session_duration,
      p.cpt_code,
      "Cancelled",
      "Patient cancelled same-day via text"
    )
  );
})();

// Sarah Johnson — cancelled next week's session (reschedule requested)
(() => {
  const p = PATIENTS.find((pt) => pt.id === "sarah-johnson")!;
  allAppointments.push(
    apt(
      p.id,
      10,
      nextAppointmentDate(p.preferred_day),
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
