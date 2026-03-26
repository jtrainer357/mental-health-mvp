/**
 * Patients Page Types
 * Shared interfaces for patients page components
 */

import type {
  Patient as DbPatient,
  Appointment,
  Invoice,
  OutcomeMeasure,
  Review,
} from "@/src/lib/supabase/types";
import type { VisitSummary, Communication } from "@/src/lib/queries/patients";
import type { PatientPriorityAction } from "@/src/lib/queries/priority-actions";
import type { Patient } from "../patient-list-sidebar";
import type {
  PatientDetail,
  PatientMessage,
  PatientInvoice,
  PatientOutcomeMeasure,
  PatientReview,
  PriorityAction,
} from "../patient-detail-view";

export type {
  DbPatient,
  Appointment,
  Invoice,
  OutcomeMeasure,
  Review,
  VisitSummary,
  Communication,
  PatientPriorityAction,
  Patient,
  PatientDetail,
  PatientMessage,
  PatientInvoice,
  PatientOutcomeMeasure,
  PatientReview,
  PriorityAction,
};

export interface PatientsPageProps {
  initialPatientId?: string;
  initialPatientName?: string;
  initialTab?: string;
  startSession?: boolean;
}

export const patientFilterTabs = [
  { id: "all", label: "All Patients" },
  { id: "active", label: "Active" },
  { id: "new", label: "New" },
  { id: "inactive", label: "Inactive" },
];
