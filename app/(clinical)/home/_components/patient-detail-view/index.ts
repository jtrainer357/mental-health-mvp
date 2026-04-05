/**
 * Patient Detail View Module
 *
 * This module exports the PatientDetailView component and related types.
 * The component has been decomposed into the following sub-components:
 * - PatientHeader - Patient info header with avatar and stats
 * - AdaptivePatientHeader - Responsive header with three height modes
 * - OverviewTab - Prioritized actions and recent activity
 * - AppointmentsTab - Appointment history
 * - MedicalRecordsTab - Clinical records and outcome measures
 * - MessagesTab - Patient messaging/chat interface
 * - BillingTab - Patient billing and invoices
 * - ReviewsTab - Patient reviews
 * - VisitSummaryPanel - Visit summary with clinical notes
 * - ClinicalNoteView - Full SOAP note view with full-screen toggle
 *
 * Only the main PatientDetailView component is exported as the public API.
 */

export { PatientDetailView } from "./patient-detail-view";
export { AdaptivePatientHeader } from "./adaptive-patient-header";
export type { AdaptivePatientHeaderProps } from "./adaptive-patient-header";
export { ClinicalNoteView } from "./clinical-note-view";
export type {
  PatientDetail,
  PatientDetailViewProps,
  PatientMessage,
  PatientInvoice,
  PatientOutcomeMeasure,
  PatientReview,
  PriorityAction,
} from "./types";
