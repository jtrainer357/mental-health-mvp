/**
 * 200+ Synthetic Appointments
 * Past, TODAY, and Future appointments for realistic schedule
 */

import { SYNTHETIC_PATIENTS } from "./synthetic-patients";
import { DEMO_DATE } from "@/src/lib/utils/demo-date";

export interface SyntheticAppointment {
  id: string;
  patient_id: string;
  patient_name: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM (24h)
  end_time: string;
  duration_minutes: number;
  status: "Completed" | "Scheduled" | "No-Show" | "Cancelled";
  service_type: string;
  cpt_code: string;
  location: string;
  notes?: string;
}

// Patient name lookup - derive from single source of truth
const patientNameMap = new Map<string, string>();
SYNTHETIC_PATIENTS.forEach((p) => {
  patientNameMap.set(p.id, `${p.first_name} ${p.last_name}`);
});

/**
 * Get patient full name from patient_id (external_id)
 * This ensures all appointments use consistent names from patient data
 */
function getPatientName(patientId: string): string {
  return patientNameMap.get(patientId) || "Unknown Patient";
}

const serviceTypes = [
  { name: "Individual Therapy (45 min)", cpt: "90834", duration: 45 },
  { name: "Individual Therapy (60 min)", cpt: "90837", duration: 60 },
  { name: "Initial Evaluation", cpt: "90791", duration: 60 },
  { name: "Crisis Session", cpt: "90839", duration: 60 },
];

const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

// Seeded random for consistency
let seed = 12345;
function seededRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function generateAppointments(): SyntheticAppointment[] {
  const appointments: SyntheticAppointment[] = [];
  let appointmentId = 1;

  // PAST APPOINTMENTS (last 6 months)
  for (let daysAgo = 180; daysAgo > 0; daysAgo -= 1) {
    if (seededRandom() > 0.3) continue; // Skip ~70% of days

    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split("T")[0]!;

    // 3-6 appointments per day
    const numAppts = 3 + Math.floor(seededRandom() * 4);
    const usedSlots: string[] = [];

    for (let i = 0; i < numAppts; i++) {
      const patient = SYNTHETIC_PATIENTS[Math.floor(seededRandom() * SYNTHETIC_PATIENTS.length)]!;
      const service = serviceTypes[Math.floor(seededRandom() * serviceTypes.length)]!;
      let timeSlot = timeSlots[Math.floor(seededRandom() * timeSlots.length)]!;
      let attempts = 0;
      while (usedSlots.includes(timeSlot) && attempts < 10) {
        timeSlot = timeSlots[Math.floor(seededRandom() * timeSlots.length)]!;
        attempts++;
      }
      if (usedSlots.includes(timeSlot)) continue;
      usedSlots.push(timeSlot);

      const [hours, mins] = timeSlot.split(":").map(Number);
      const endHours = hours! + Math.floor((mins! + service.duration) / 60);
      const endMins = (mins! + service.duration) % 60;

      // 5% no-show rate, 3% cancelled
      let status: SyntheticAppointment["status"] = "Completed";
      const rand = seededRandom();
      if (rand < 0.05) status = "No-Show";
      else if (rand < 0.08) status = "Cancelled";

      appointments.push({
        id: `apt-${String(appointmentId++).padStart(5, "0")}`,
        patient_id: patient.id,
        patient_name: `${patient.first_name} ${patient.last_name}`,
        date: dateStr,
        start_time: timeSlot,
        end_time: `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`,
        duration_minutes: service.duration,
        status,
        service_type: service.name,
        cpt_code: service.cpt,
        location: "Main Office",
      });
    }
  }

  // TODAY'S APPOINTMENTS (8 appointments for demo)
  const today = new Date().toISOString().split("T")[0]!;
  const todayPatients = SYNTHETIC_PATIENTS.slice(0, 8);
  const todaySlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  todayPatients.forEach((patient, i) => {
    const service = serviceTypes[i % 2]!; // Alternate 45/60 min
    const timeSlot = todaySlots[i]!;
    const [hours, mins] = timeSlot.split(":").map(Number);
    const endHours = hours! + Math.floor((mins! + service.duration) / 60);
    const endMins = (mins! + service.duration) % 60;

    appointments.push({
      id: `apt-${String(appointmentId++).padStart(5, "0")}`,
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      date: today,
      start_time: timeSlot,
      end_time: `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`,
      duration_minutes: service.duration,
      status: i < 3 ? "Completed" : "Scheduled", // First 3 done, rest upcoming
      service_type: service.name,
      cpt_code: service.cpt,
      location: "Main Office",
    });
  });

  // FUTURE APPOINTMENTS (next 2 weeks)
  for (let daysAhead = 1; daysAhead <= 14; daysAhead++) {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split("T")[0]!;
    const numAppts = 4 + Math.floor(seededRandom() * 4);
    const usedSlots: string[] = [];

    for (let i = 0; i < numAppts; i++) {
      const patient = SYNTHETIC_PATIENTS[Math.floor(seededRandom() * SYNTHETIC_PATIENTS.length)]!;
      const service = serviceTypes[Math.floor(seededRandom() * serviceTypes.length)]!;
      let timeSlot = timeSlots[Math.floor(seededRandom() * timeSlots.length)]!;
      let attempts = 0;
      while (usedSlots.includes(timeSlot) && attempts < 10) {
        timeSlot = timeSlots[Math.floor(seededRandom() * timeSlots.length)]!;
        attempts++;
      }
      if (usedSlots.includes(timeSlot)) continue;
      usedSlots.push(timeSlot);

      const [hours, mins] = timeSlot.split(":").map(Number);
      const endHours = hours! + Math.floor((mins! + service.duration) / 60);
      const endMins = (mins! + service.duration) % 60;

      appointments.push({
        id: `apt-${String(appointmentId++).padStart(5, "0")}`,
        patient_id: patient.id,
        patient_name: `${patient.first_name} ${patient.last_name}`,
        date: dateStr,
        start_time: timeSlot,
        end_time: `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`,
        duration_minutes: service.duration,
        status: "Scheduled",
        service_type: service.name,
        cpt_code: service.cpt,
        location: "Main Office",
      });
    }
  }

  // ============================================================================
  // COMPREHENSIVE DEMO PATIENT APPOINTMENTS
  // 10 patients with full appointment histories + today's schedule
  // ============================================================================

  const demoDate = DEMO_DATE; // 2026-02-09

  // Helper to generate appointment ID
  const demoAptId = (prefix: string, index: number) =>
    `apt-demo-${prefix}-${String(index).padStart(3, "0")}`;

  // Helper to calculate end time
  const calcEndTime = (startTime: string, duration: number) => {
    const [hours, mins] = startTime.split(":").map(Number);
    const endHours = hours! + Math.floor((mins! + duration) / 60);
    const endMins = (mins! + duration) % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
  };

  // 1. RACHEL TORRES - 6 past appointments + 1 today
  const rachelDates = [
    "2025-06-22",
    "2025-07-20",
    "2025-09-14",
    "2025-10-26",
    "2025-12-07",
    "2026-01-26",
  ];
  rachelDates.forEach((date, i) => {
    appointments.push({
      id: demoAptId("rachel", i + 1),
      patient_id: "rachel-torres-demo",
      patient_name: getPatientName("rachel-torres-demo"),
      date,
      start_time: "09:00",
      end_time: "09:53",
      duration_minutes: 53,
      status: "Completed",
      service_type: "Individual Therapy (60 min)",
      cpt_code: "90837",
      location: "Main Office",
    });
  });
  // Today's appointment
  appointments.push({
    id: demoAptId("rachel", 7),
    patient_id: "rachel-torres-demo",
    patient_name: getPatientName("rachel-torres-demo"),
    date: demoDate,
    start_time: "09:00",
    end_time: "09:53",
    duration_minutes: 53,
    status: "Scheduled",
    service_type: "Individual Therapy (60 min)",
    cpt_code: "90837",
    location: "Main Office",
    notes: "Depression maintenance check-in, career transition update",
  });

  // 2. JAMES OKAFOR - 5 past appointments (1 no-show) + 1 today
  const jamesDates = ["2025-04-17", "2025-06-12", "2025-08-07", "2025-09-15", "2025-11-20"];
  jamesDates.forEach((date, i) => {
    const isNoShow = date === "2025-09-15";
    appointments.push({
      id: demoAptId("james", i + 1),
      patient_id: "james-okafor-demo",
      patient_name: getPatientName("james-okafor-demo"),
      date,
      start_time: "10:30",
      end_time: "11:23",
      duration_minutes: 53,
      status: isNoShow ? "No-Show" : "Completed",
      service_type: "Individual Therapy (60 min)",
      cpt_code: "90837",
      location: "Main Office",
      notes: isNoShow ? "Patient did not attend - work conflict" : undefined,
    });
  });
  // Today's appointment
  appointments.push({
    id: demoAptId("james", 6),
    patient_id: "james-okafor-demo",
    patient_name: getPatientName("james-okafor-demo"),
    date: demoDate,
    start_time: "10:30",
    end_time: "11:23",
    duration_minutes: 53,
    status: "Scheduled",
    service_type: "Individual Therapy (60 min)",
    cpt_code: "90837",
    location: "Main Office",
    notes: "CPT trauma narrative - continue processing",
  });

  // 3. SOPHIA CHEN-MARTINEZ - 5 past appointments + 1 today
  const sophiaDates = ["2025-09-08", "2025-10-06", "2025-11-03", "2025-12-01", "2026-01-12"];
  sophiaDates.forEach((date, i) => {
    appointments.push({
      id: demoAptId("sophia", i + 1),
      patient_id: "sophia-chen-martinez-demo",
      patient_name: getPatientName("sophia-chen-martinez-demo"),
      date,
      start_time: "13:00",
      end_time: "13:45",
      duration_minutes: 45,
      status: "Completed",
      service_type: "Individual Therapy (45 min)",
      cpt_code: "90834",
      location: "Main Office",
    });
  });
  // Today's appointment
  appointments.push({
    id: demoAptId("sophia", 6),
    patient_id: "sophia-chen-martinez-demo",
    patient_name: getPatientName("sophia-chen-martinez-demo"),
    date: demoDate,
    start_time: "13:00",
    end_time: "13:45",
    duration_minutes: 45,
    status: "Scheduled",
    service_type: "Individual Therapy (45 min)",
    cpt_code: "90834",
    location: "Main Office",
    notes: "Academic anxiety - qualifying exams approaching",
  });

  // 4. MARCUS WASHINGTON - 8 past appointments (longest history) + 1 today
  const marcusDates = [
    "2024-12-02",
    "2025-01-06",
    "2025-02-03",
    "2025-03-03",
    "2025-05-05",
    "2025-07-07",
    "2025-09-08",
    "2026-01-12",
  ];
  marcusDates.forEach((date, i) => {
    appointments.push({
      id: demoAptId("marcus", i + 1),
      patient_id: "marcus-washington-demo",
      patient_name: getPatientName("marcus-washington-demo"),
      date,
      start_time: "15:30",
      end_time: "16:23",
      duration_minutes: 53,
      status: "Completed",
      service_type: "Individual Therapy (60 min)",
      cpt_code: "90837",
      location: "Main Office",
    });
  });
  // Today's appointment
  appointments.push({
    id: demoAptId("marcus", 9),
    patient_id: "marcus-washington-demo",
    patient_name: getPatientName("marcus-washington-demo"),
    date: demoDate,
    start_time: "15:30",
    end_time: "16:23",
    duration_minutes: 53,
    status: "Scheduled",
    service_type: "Med Management + Therapy",
    cpt_code: "90837",
    location: "Main Office",
    notes: "8-month stability review, bipolar maintenance",
  });

  // 5. EMMA KOWALSKI - 4 past appointments + 2 upcoming (Feb 10, Feb 12)
  const emmaDates = ["2025-04-01", "2025-06-15", "2025-09-22", "2026-01-29"];
  emmaDates.forEach((date, i) => {
    appointments.push({
      id: demoAptId("emma", i + 1),
      patient_id: "emma-kowalski-demo",
      patient_name: getPatientName("emma-kowalski-demo"),
      date,
      start_time: "11:00",
      end_time: "11:53",
      duration_minutes: 53,
      status: "Completed",
      service_type: "Individual Therapy (60 min)",
      cpt_code: "90837",
      location: "Main Office",
    });
  });
  // Feb 10 appointment
  appointments.push({
    id: demoAptId("emma", 5),
    patient_id: "emma-kowalski-demo",
    patient_name: getPatientName("emma-kowalski-demo"),
    date: "2026-02-10",
    start_time: "10:00",
    end_time: "10:53",
    duration_minutes: 53,
    status: "Scheduled",
    service_type: "Individual Therapy (60 min)",
    cpt_code: "90837",
    location: "Main Office",
  });
  // Feb 12 appointment
  appointments.push({
    id: demoAptId("emma", 6),
    patient_id: "emma-kowalski-demo",
    patient_name: getPatientName("emma-kowalski-demo"),
    date: "2026-02-12",
    start_time: "11:00",
    end_time: "11:53",
    duration_minutes: 53,
    status: "Scheduled",
    service_type: "Individual Therapy (60 min)",
    cpt_code: "90837",
    location: "Main Office",
    notes: "ED recovery check-in, body image work",
  });

  // 6. DAVID NAKAMURA - 4 past appointments + 1 upcoming (Feb 10)
  const davidDates = ["2025-10-08", "2025-11-05", "2025-12-03", "2026-01-28"];
  davidDates.forEach((date, i) => {
    appointments.push({
      id: demoAptId("david", i + 1),
      patient_id: "david-nakamura-demo",
      patient_name: getPatientName("david-nakamura-demo"),
      date,
      start_time: "14:00",
      end_time: "14:53",
      duration_minutes: 53,
      status: "Completed",
      service_type: "Individual Therapy (60 min)",
      cpt_code: "90837",
      location: "Main Office",
    });
  });
  // Feb 10 appointment
  appointments.push({
    id: demoAptId("david", 5),
    patient_id: "david-nakamura-demo",
    patient_name: getPatientName("david-nakamura-demo"),
    date: "2026-02-10",
    start_time: "14:00",
    end_time: "14:53",
    duration_minutes: 53,
    status: "Scheduled",
    service_type: "Individual Therapy (60 min)",
    cpt_code: "90837",
    location: "Main Office",
    notes: "Work-life balance, wife may join",
  });

  // 7. AALIYAH BROOKS - 5 past appointments (1 cancelled) + 1 upcoming (Feb 11)
  const aaliyahDates = ["2025-08-20", "2025-09-17", "2025-10-15", "2025-11-05", "2026-01-28"];
  aaliyahDates.forEach((date, i) => {
    const isCancelled = date === "2025-11-05";
    appointments.push({
      id: demoAptId("aaliyah", i + 1),
      patient_id: "aaliyah-brooks-demo",
      patient_name: getPatientName("aaliyah-brooks-demo"),
      date,
      start_time: "16:00",
      end_time: "16:45",
      duration_minutes: 45,
      status: isCancelled ? "Cancelled" : "Completed",
      service_type: "Individual Therapy (45 min)",
      cpt_code: "90834",
      location: "Main Office",
      notes: isCancelled ? "Patient cancelled - school conflict" : undefined,
    });
  });
  // Feb 11 appointment
  appointments.push({
    id: demoAptId("aaliyah", 6),
    patient_id: "aaliyah-brooks-demo",
    patient_name: getPatientName("aaliyah-brooks-demo"),
    date: "2026-02-11",
    start_time: "16:00",
    end_time: "16:45",
    duration_minutes: 45,
    status: "Scheduled",
    service_type: "Individual Therapy (45 min)",
    cpt_code: "90834",
    location: "Main Office",
    notes: "Social anxiety exposure hierarchy, identity exploration",
  });

  // 8. ROBERT FITZGERALD - 5 past appointments + 1 upcoming (Feb 13)
  const robertDates = ["2025-07-10", "2025-08-21", "2025-10-02", "2025-11-13", "2026-01-30"];
  robertDates.forEach((date, i) => {
    appointments.push({
      id: demoAptId("robert", i + 1),
      patient_id: "robert-fitzgerald-demo",
      patient_name: getPatientName("robert-fitzgerald-demo"),
      date,
      start_time: "10:00",
      end_time: "10:53",
      duration_minutes: 53,
      status: "Completed",
      service_type: "Individual Therapy (60 min)",
      cpt_code: "90837",
      location: "Main Office",
    });
  });
  // Feb 13 appointment
  appointments.push({
    id: demoAptId("robert", 6),
    patient_id: "robert-fitzgerald-demo",
    patient_name: getPatientName("robert-fitzgerald-demo"),
    date: "2026-02-13",
    start_time: "10:00",
    end_time: "10:53",
    duration_minutes: 53,
    status: "Scheduled",
    service_type: "Individual Therapy (60 min)",
    cpt_code: "90837",
    location: "Main Office",
    notes: "Grief processing, cognitive screening follow-up",
  });

  // 9. CARMEN ALVAREZ - 4 past appointments (weekly initially) + 1 upcoming (Feb 14)
  const carmenDates = ["2025-11-10", "2025-11-24", "2025-12-15", "2026-02-07"];
  carmenDates.forEach((date, i) => {
    appointments.push({
      id: demoAptId("carmen", i + 1),
      patient_id: "carmen-alvarez-demo",
      patient_name: getPatientName("carmen-alvarez-demo"),
      date,
      start_time: "09:00",
      end_time: "09:53",
      duration_minutes: 53,
      status: "Completed",
      service_type: "Individual Therapy (60 min)",
      cpt_code: "90837",
      location: "Main Office",
    });
  });
  // Feb 14 appointment
  appointments.push({
    id: demoAptId("carmen", 5),
    patient_id: "carmen-alvarez-demo",
    patient_name: getPatientName("carmen-alvarez-demo"),
    date: "2026-02-14",
    start_time: "09:00",
    end_time: "09:53",
    duration_minutes: 53,
    status: "Scheduled",
    service_type: "Individual Therapy (60 min)",
    cpt_code: "90837",
    location: "Main Office",
    notes: "PPD follow-up, bonding assessment, safety check",
  });

  // 10. TYLER HARRISON - NEW PATIENT - Intake today only
  appointments.push({
    id: demoAptId("tyler", 1),
    patient_id: "tyler-harrison-demo",
    patient_name: getPatientName("tyler-harrison-demo"),
    date: demoDate,
    start_time: "17:00",
    end_time: "18:00",
    duration_minutes: 60,
    status: "Scheduled",
    service_type: "Initial Evaluation",
    cpt_code: "90791",
    location: "Main Office",
    notes: "NEW PATIENT INTAKE - stress, relationship issues, anger management",
  });

  // ============================================================================
  // WEEK 1 TESTING ADDITIONS — 3 more appointments for 8-patient test day
  // ============================================================================

  // 11. LISA WHITFIELD — Established patient, regular session
  appointments.push({
    id: demoAptId("lisa", 1),
    patient_id: "lisa-whitfield-demo",
    patient_name: getPatientName("lisa-whitfield-demo"),
    date: demoDate,
    start_time: "11:30",
    end_time: "12:23",
    duration_minutes: 53,
    status: "Scheduled",
    service_type: "Individual Therapy (60 min)",
    cpt_code: "90837",
    location: "Main Office",
    notes: "Anxiety management follow-up, exposure homework review",
  });

  // 12. KEVIN RHODES — SAME-DAY CANCELLATION
  appointments.push({
    id: demoAptId("kevin", 1),
    patient_id: "kevin-rhodes-demo",
    patient_name: getPatientName("kevin-rhodes-demo"),
    date: demoDate,
    start_time: "14:30",
    end_time: "15:23",
    duration_minutes: 53,
    status: "Cancelled",
    service_type: "Individual Therapy (60 min)",
    cpt_code: "90837",
    location: "Main Office",
    notes: "SAME-DAY CANCELLATION — Patient called at 7:45 AM, work conflict",
  });

  // 13. PRIYA SHARMA — Outstanding balance patient
  appointments.push({
    id: demoAptId("priya", 1),
    patient_id: "priya-sharma-demo",
    patient_name: getPatientName("priya-sharma-demo"),
    date: demoDate,
    start_time: "16:30",
    end_time: "17:23",
    duration_minutes: 53,
    status: "Scheduled",
    service_type: "Individual Therapy (60 min)",
    cpt_code: "90837",
    location: "Main Office",
    notes: "OCD exposure therapy continuation, homework compliance check",
  });

  // LISA WHITFIELD — 4 past appointments
  const lisaDates = ["2025-06-01", "2025-08-15", "2025-11-01", "2026-01-26"];
  lisaDates.forEach((date, i) => {
    appointments.push({
      id: demoAptId("lisa", i + 2), // +2 because lisa-1 is today
      patient_id: "lisa-whitfield-demo",
      patient_name: getPatientName("lisa-whitfield-demo"),
      date,
      start_time: "11:30",
      end_time: "12:23",
      duration_minutes: 53,
      status: "Completed",
      service_type: "Individual Therapy (60 min)",
      cpt_code: "90837",
      location: "Main Office",
    });
  });

  // KEVIN RHODES — 5 past appointments (1 no-show, showing pattern)
  const kevinDates = ["2024-10-01", "2024-11-15", "2025-03-10", "2025-08-20", "2026-01-28"];
  kevinDates.forEach((date, i) => {
    const isNoShow = date === "2025-03-10";
    appointments.push({
      id: demoAptId("kevin", i + 2),
      patient_id: "kevin-rhodes-demo",
      patient_name: getPatientName("kevin-rhodes-demo"),
      date,
      start_time: "14:30",
      end_time: "15:23",
      duration_minutes: 53,
      status: isNoShow ? "No-Show" : "Completed",
      service_type: "Individual Therapy (60 min)",
      cpt_code: "90837",
      location: "Main Office",
      notes: isNoShow ? "Patient did not attend — no advance notice" : undefined,
    });
  });

  // PRIYA SHARMA — 4 past appointments
  const priyaDates = ["2025-08-01", "2025-10-15", "2025-12-10", "2026-01-30"];
  priyaDates.forEach((date, i) => {
    appointments.push({
      id: demoAptId("priya", i + 2),
      patient_id: "priya-sharma-demo",
      patient_name: getPatientName("priya-sharma-demo"),
      date,
      start_time: "16:30",
      end_time: "17:23",
      duration_minutes: 53,
      status: "Completed",
      service_type: "Individual Therapy (60 min)",
      cpt_code: "90837",
      location: "Main Office",
    });
  });

  return appointments.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.start_time.localeCompare(b.start_time);
  });
}

export const SYNTHETIC_APPOINTMENTS = generateAppointments();
export default SYNTHETIC_APPOINTMENTS;
