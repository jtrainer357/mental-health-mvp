/**
 * Patient Detail View Types
 * Shared interfaces for patient detail components
 */

import type { PatientStatus } from "@/design-system/components/ui/patient-list-card";
import type { PriorityLevel, ActionType } from "@/design-system/components/ui/priority-action-card";

export interface PriorityAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  priority: PriorityLevel;
  dueDate?: string;
  aiConfidence?: number;
}

export interface PatientMessage {
  id: string;
  channel: string;
  direction: string;
  sender: string | null;
  messageBody: string | null;
  isRead: boolean;
  sentAt: string | null;
}

export interface PatientInvoice {
  id: string;
  invoiceDate: string | null;
  dateOfService: string | null;
  description: string | null;
  chargeAmount: number;
  insurancePaid: number;
  patientPaid: number;
  balance: number;
  status: string;
}

export interface PatientOutcomeMeasure {
  id: string;
  measureType: string;
  score: number | null;
  measurementDate: string;
  notes: string | null;
}

export interface PatientReview {
  id: string;
  reviewerName: string | null;
  reviewType: string;
  rating: number;
  title: string;
  reviewText: string;
  reviewDate: string;
  isAnonymous: boolean;
}

export interface PatientDetail {
  id: string;
  name: string;
  status: PatientStatus;
  dob: string;
  age: number;
  phone: string;
  phoneExt?: string;
  email: string;
  insurance?: string;
  avatarSrc?: string;
  lastVisit: {
    date: string;
    type: string;
  };
  appointments: {
    total: number;
    dateRange: string;
  };
  balance: {
    amount: string;
    type: string;
  };
  upcomingAppointments: Array<{
    id: string;
    status:
      | "Scheduled"
      | "Confirmed"
      | "Checked In"
      | "In Progress"
      | "Completed"
      | "Cancelled"
      | "No-Show";
    date: string;
    time: string;
    type: string;
    provider: string;
  }>;
  allAppointments?: Array<{
    id: string;
    status: string;
    date: string;
    time: string;
    type: string;
    provider: string;
  }>;
  prioritizedActions?: PriorityAction[];
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    visitSummary?: string;
    duration?: string;
    provider?: string;
    appointmentType?: string;
    diagnosisCodes?: string[];
    treatmentNotes?: string;
    nextSteps?: string;
  }>;
  messages?: PatientMessage[];
  invoices?: PatientInvoice[];
  outcomeMeasures?: PatientOutcomeMeasure[];
  reviews?: PatientReview[];
}

export interface PatientDetailViewProps {
  patient: PatientDetail | null;
  className?: string;
  /** Initial tab to display (overview, appointments, medical-records, messages, billing, reviews) */
  initialTab?: string;
  /** Callback to navigate back to patient roster (mobile only) */
  onBackToRoster?: () => void;
}
