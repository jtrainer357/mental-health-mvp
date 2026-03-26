/**
 * Patients Page Utilities
 * Helper functions for patient data transformation
 */

import type {
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
} from "./types";
import { getDemoSessionNoteByAppointmentId, getExternalIdFromUUID } from "@/src/lib/data/adapter";
import { PATIENTS } from "@/src/lib/data/patients";

// Convert DB patient to list format
export function dbPatientToListItem(patient: DbPatient): Patient {
  const age = Math.floor(
    (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const dobFormatted = new Date(patient.date_of_birth).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  return {
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
    age,
    dob: dobFormatted,
    phone: patient.phone_mobile || "(No phone)",
    lastActivity: new Date().toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }),
    status:
      patient.status === "Active" ? "ACTIVE" : patient.status === "Inactive" ? "INACTIVE" : "NEW",
    avatarSrc: patient.avatar_url || undefined,
  };
}

// Map service types to more descriptive titles
function getActivityTitle(serviceType: string): string {
  const titleMap: Record<string, string> = {
    "Individual Therapy": "Psychotherapy Session",
    "Initial Intake": "Initial Assessment",
    "Medication Management": "Medication Review",
    "Group Therapy": "Group Therapy Session",
    "Family Therapy": "Family Therapy Session",
    "Couples Therapy": "Couples Therapy Session",
    "Crisis Intervention": "Crisis Intervention",
    Telehealth: "Telehealth Session",
    "Follow-up": "Follow-up Appointment",
  };
  return titleMap[serviceType] || serviceType;
}

// Generate a descriptive summary based on appointment data
function getActivityDescription(appointment: Appointment, patientName: string): string {
  // Use notes if available and meaningful
  if (appointment.notes && appointment.notes.length > 10) {
    // Truncate long notes to first sentence or 100 chars
    const firstSentence = appointment.notes.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 10) {
      return firstSentence.length > 100
        ? firstSentence.substring(0, 100) + "..."
        : firstSentence + ".";
    }
  }

  // Generate description based on service type
  const durationStr = appointment.duration_minutes
    ? `${appointment.duration_minutes}-minute`
    : "60-minute";

  const descriptions: Record<string, string> = {
    "Individual Therapy": `${durationStr} individual therapy session. Discussed coping strategies and treatment progress.`,
    "Initial Intake": `Comprehensive initial assessment completed. Treatment plan discussed with ${patientName}.`,
    "Medication Management": `Reviewed current prescriptions and medication effectiveness. Discussed any side effects.`,
    "Group Therapy": `Group therapy session focused on building coping skills and peer support.`,
    "Family Therapy": `Family therapy session addressing communication patterns and support strategies.`,
    Telehealth: `${durationStr} telehealth session completed. Continued work on treatment goals.`,
    "Follow-up": `Follow-up appointment for ongoing care and progress review.`,
  };

  return (
    descriptions[appointment.service_type] ||
    `${durationStr} session with ${patientName}. Treatment goals reviewed.`
  );
}

// Generate visit summary details for the sliding panel
function getVisitSummaryDetails(serviceType: string, patientName: string, duration?: number) {
  const durationStr = duration ? `${duration} minutes` : "60 minutes";
  const focusAreas: Record<string, string[]> = {
    "Individual Therapy": ["Anxiety Management", "Cognitive Restructuring", "Coping Skills"],
    "Initial Intake": ["Assessment", "History Review", "Treatment Planning"],
    "Medication Management": ["Medication Review", "Side Effects", "Dosage Adjustment"],
    "Group Therapy": ["Peer Support", "Social Skills", "Shared Experiences"],
    "Family Therapy": ["Communication", "Family Dynamics", "Support Systems"],
    Telehealth: ["Remote Care", "Progress Review", "Goal Setting"],
    "Follow-up": ["Progress Review", "Treatment Adjustment", "Goal Tracking"],
  };
  const treatmentNotes: Record<string, string> = {
    "Individual Therapy": `Patient engaged well in session. Practiced cognitive restructuring techniques for managing anxious thoughts. Reviewed homework assignments from previous session.`,
    "Initial Intake": `Completed comprehensive intake assessment. Discussed presenting concerns, history, and treatment goals. Established rapport and outlined treatment approach.`,
    "Medication Management": `Reviewed current medication regimen. Patient reports improved symptoms with manageable side effects. Continue current dosage and monitor.`,
    "Group Therapy": `Patient participated actively in group discussion. Showed improvement in sharing experiences and providing peer support.`,
    "Family Therapy": `Facilitated productive family discussion on communication patterns. Identified areas for improvement and assigned family exercises.`,
    Telehealth: `Successfully conducted telehealth session. Patient comfortable with virtual format. Addressed ongoing concerns and adjusted treatment plan.`,
    "Follow-up": `Reviewed progress since last session. Patient meeting treatment goals. Adjusted care plan as needed.`,
  };
  const nextSteps: Record<string, string> = {
    "Individual Therapy": `Continue practicing mindfulness techniques between sessions. Complete thought log for next appointment.`,
    "Initial Intake": `Schedule follow-up appointment to begin treatment. Review intake documentation and treatment plan.`,
    "Medication Management": `Continue current medication. Follow up in 4 weeks to assess effectiveness.`,
    "Group Therapy": `Attend next group session. Practice skills discussed with support network.`,
    "Family Therapy": `Complete family communication exercises. Schedule follow-up to review progress.`,
    Telehealth: `Schedule next telehealth appointment. Continue self-care practices discussed.`,
    "Follow-up": `Maintain current treatment plan. Check in as scheduled or if concerns arise.`,
  };

  return {
    duration: durationStr,
    provider: "Dr. Demo",
    diagnosisCodes: focusAreas[serviceType] || ["General Treatment"],
    treatmentNotes:
      treatmentNotes[serviceType] || `Session with ${patientName} completed successfully.`,
    nextSteps: nextSteps[serviceType] || `Continue current treatment plan and schedule follow-up.`,
  };
}

// Convert DB data to detail format
export function createPatientDetail(
  patient: DbPatient,
  appointments: Appointment[],
  invoices: Invoice[],
  visitSummaries: VisitSummary[] = [],
  messages: Communication[] = [],
  outcomeMeasures: OutcomeMeasure[] = [],
  reviews: Review[] = []
): PatientDetail {
  const age = Math.floor(
    (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const dobFormatted = new Date(patient.date_of_birth).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  // Get last visit
  const sortedAppts = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastAppt = sortedAppts.find((a) => a.status === "Completed");

  // Calculate outstanding balance
  const outstandingBalance = invoices
    .filter((i) => i.balance > 0)
    .reduce((sum, i) => sum + i.balance, 0);

  // Get date range
  const years =
    appointments.length > 0
      ? [...new Set(appointments.map((a) => new Date(a.date).getFullYear()))].sort()
      : [new Date().getFullYear()];
  const dateRange =
    years.length === 1 ? String(years[0]) : `${years[0]} - ${years[years.length - 1]}`;

  // Get upcoming appointments
  const now = new Date();
  const upcomingAppts = sortedAppts
    .filter((a) => new Date(a.date) >= now && a.status === "Scheduled")
    .slice(0, 3)
    .map((a) => ({
      id: a.id,
      status: "Scheduled" as const,
      date: new Date(a.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: a.start_time,
      type: a.service_type,
      provider: "Dr. Demo",
    }));

  // Get recent activity from visit summaries (preferred) or appointments
  const recentActivity =
    visitSummaries.length > 0
      ? visitSummaries.slice(0, 5).map((vs) => {
          const serviceType = vs.appointment_type || "Visit";
          const details = getVisitSummaryDetails(serviceType, patient.first_name);
          return {
            id: vs.id,
            title: getActivityTitle(serviceType),
            description: vs.visit_summary || `Session with ${patient.first_name}`,
            date: new Date(vs.visit_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            visitSummary: vs.visit_summary || details.treatmentNotes,
            duration: details.duration,
            provider: details.provider,
            appointmentType: serviceType,
            diagnosisCodes: details.diagnosisCodes,
            treatmentNotes: details.treatmentNotes,
            nextSteps: details.nextSteps,
          };
        })
      : sortedAppts
          .filter((a) => {
            // Include completed appointments and any past appointments
            const isPast = new Date(a.date) < now;
            return a.status === "Completed" || isPast;
          })
          .slice(0, 5)
          .map((a) => {
            const details = getVisitSummaryDetails(
              a.service_type,
              patient.first_name,
              a.duration_minutes
            );
            // Look up real SOAP note by appointment external_id
            const sessionNote = a.external_id
              ? getDemoSessionNoteByAppointmentId(a.external_id)
              : null;
            return {
              id: a.id,
              title: getActivityTitle(a.service_type),
              description: sessionNote
                ? sessionNote.subjective.slice(0, 120) + "..."
                : getActivityDescription(a, patient.first_name),
              date: new Date(a.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              visitSummary: sessionNote?.assessment || a.notes || details.treatmentNotes,
              duration: sessionNote ? `${sessionNote.duration_minutes} minutes` : details.duration,
              provider: sessionNote?.signed_by || details.provider,
              appointmentType: a.service_type,
              diagnosisCodes: details.diagnosisCodes,
              treatmentNotes: sessionNote?.assessment || details.treatmentNotes,
              nextSteps: sessionNote?.plan || details.nextSteps,
              // Real SOAP data
              subjective: sessionNote?.subjective,
              objective: sessionNote?.objective,
              assessment: sessionNote?.assessment,
              plan: sessionNote?.plan,
              noteStatus: sessionNote?.status,
              signedAt: sessionNote?.signed_at,
              signedBy: sessionNote?.signed_by,
              cptCode: sessionNote?.cpt_code,
              noteType: sessionNote?.note_type,
            };
          });

  // Map all appointments for the appointments tab
  const allAppts = sortedAppts.map((a) => ({
    id: a.id,
    status: a.status,
    date: new Date(a.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: a.start_time,
    type: a.service_type,
    provider: "Dr. Demo",
  }));

  // Map messages (reverse to show oldest first, newest at bottom for chat view)
  const mappedMessages: PatientMessage[] = [...messages].reverse().map((m) => ({
    id: m.id,
    channel: m.channel,
    direction: m.direction,
    sender: m.direction === "inbound" ? "Patient" : "Practice",
    messageBody: m.content,
    isRead: m.read,
    sentAt: m.timestamp,
  }));

  // Map invoices
  const mappedInvoices: PatientInvoice[] = invoices.map((inv) => ({
    id: inv.id,
    invoiceDate: inv.date_of_service ?? null,
    dateOfService: inv.date_of_service ?? null,
    description: inv.cpt_code ? `Service (${inv.cpt_code})` : "Service Charge",
    chargeAmount: inv.charge_amount,
    insurancePaid: inv.insurance_paid,
    patientPaid: inv.patient_paid,
    balance: inv.balance,
    status: inv.status,
  }));

  // Map outcome measures
  const mappedOutcomeMeasures: PatientOutcomeMeasure[] = outcomeMeasures.map((om) => ({
    id: om.id,
    measureType: om.measure_type,
    score: om.score,
    measurementDate: om.measurement_date,
    notes: om.notes,
  }));

  // Map reviews
  const mappedReviews: PatientReview[] = reviews.map((r) => ({
    id: r.id,
    reviewerName: r.reviewer_name,
    reviewType: r.review_type,
    rating: r.rating,
    title: r.title,
    reviewText: r.review_text,
    reviewDate: r.review_date,
    isAnonymous: r.is_anonymous,
  }));

  return {
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
    status:
      patient.status === "Active" ? "ACTIVE" : patient.status === "Inactive" ? "INACTIVE" : "NEW",
    dob: dobFormatted,
    age,
    phone: patient.phone_mobile || "(No phone)",
    phoneExt: undefined,
    email: patient.email ?? "",
    insurance: patient.insurance_provider || "Self-Pay",
    avatarSrc: patient.avatar_url || undefined,
    primaryDiagnosisCode: patient.primary_diagnosis_code ?? undefined,
    primaryDiagnosisName: patient.primary_diagnosis_name ?? undefined,
    secondaryDiagnosisCode: patient.secondary_diagnosis_code ?? undefined,
    secondaryDiagnosisName: (() => {
      const extId = getExternalIdFromUUID(patient.id);
      const seed = extId ? PATIENTS.find((p) => p.id === extId) : null;
      return seed?.secondary_diagnosis_name;
    })(),
    medications: patient.medications ?? undefined,
    riskLevel: patient.risk_level ?? undefined,
    provider: patient.provider ?? undefined,
    treatmentStartDate: patient.treatment_start_date ?? undefined,
    lastVisit: lastAppt
      ? {
          date: new Date(lastAppt.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          type: lastAppt.service_type,
        }
      : {
          date: "No visits yet",
          type: "",
        },
    appointments: {
      total: appointments.length,
      dateRange,
    },
    balance: {
      amount: `$${outstandingBalance.toFixed(2)}`,
      type: outstandingBalance > 0 ? "Outstanding" : "Paid",
    },
    upcomingAppointments: upcomingAppts,
    allAppointments: allAppts,
    recentActivity,
    messages: mappedMessages,
    invoices: mappedInvoices,
    outcomeMeasures: mappedOutcomeMeasures,
    reviews: mappedReviews,
  };
}

// Convert DB priority action to UI format
export function dbActionToUiAction(action: PatientPriorityAction): PriorityAction {
  // Map urgency to priority level
  const priorityMap: Record<string, PriorityAction["priority"]> = {
    urgent: "urgent",
    high: "high",
    medium: "medium",
    low: "medium",
  };

  // Map action type based on title keywords
  const getActionType = (title: string): PriorityAction["type"] => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("medication") || lowerTitle.includes("refill")) return "medication";
    if (lowerTitle.includes("risk") || lowerTitle.includes("elevated")) return "risk";
    if (lowerTitle.includes("screening") || lowerTitle.includes("assessment")) return "screening";
    if (lowerTitle.includes("wellness") || lowerTitle.includes("overdue")) return "care-gap";
    return "screening";
  };

  return {
    id: action.id,
    type: getActionType(action.title),
    title: action.title,
    description: action.clinical_context || "",
    priority: priorityMap[action.urgency] || "medium",
    dueDate: action.timeframe || undefined,
    aiConfidence: action.confidence_score || 85,
  };
}
