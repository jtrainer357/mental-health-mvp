/**
 * Unified Data Layer — Single entry point
 * All seed data and types re-exported from here.
 */

// Types
export type {
  SeedPatient,
  SeedAppointment,
  SeedSessionNote,
  SeedInvoice,
  SeedOutcomeMeasure,
  SeedMessage,
  SeedPriorityAction,
} from "./types";
export { CPT_PRICES } from "./types";

// Helpers
export {
  today,
  todayDate,
  daysFromNow,
  weeksAgo,
  weeklyHistoryDates,
  nextAppointmentDate,
  computeEndTime,
  toISO,
  getPatientById,
  patientName,
} from "./helpers";

// Data
export { PATIENTS } from "./patients";
export { APPOINTMENTS } from "./appointments";
export { SESSION_NOTES } from "./session-notes";
export { INVOICES, generateBillingSummary } from "./billing";
export { OUTCOME_MEASURES } from "./outcome-measures";
export { MESSAGES } from "./messages";
export { PRIORITY_ACTIONS } from "./priority-actions";
