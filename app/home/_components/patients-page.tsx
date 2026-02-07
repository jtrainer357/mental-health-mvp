"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Database, Users } from "lucide-react";
import { PatientCardSkeleton, Skeleton } from "@/design-system/components/ui/skeleton";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Button } from "@/design-system/components/ui/button";
import { FilterTabs } from "@/design-system/components/ui/filter-tabs";
import { PatientListSidebar, Patient } from "./patient-list-sidebar";
import {
  PatientDetailView,
  PatientDetail,
  type PatientMessage,
  type PatientInvoice,
  type PatientOutcomeMeasure,
  type PatientReview,
} from "./patient-detail-view";
import {
  usePatients,
  usePatientDetails,
  usePatientVisitSummaries,
  usePatientPriorityActions,
  useIsDatabasePopulated,
  type Communication,
} from "@/src/lib/queries";
import type { VisitSummary } from "@/src/lib/queries/patients";
import type { PatientPriorityAction } from "@/src/lib/queries/priority-actions";
import type {
  Patient as DbPatient,
  Appointment,
  Invoice,
  OutcomeMeasure,
  Review,
} from "@/src/lib/supabase/types";
import type { PriorityAction } from "./patient-detail-view";
import { Text } from "@/design-system/components/ui/typography";

const patientFilterTabs = [
  { id: "all", label: "All Patients" },
  { id: "active", label: "Active" },
  { id: "new", label: "New" },
  { id: "inactive", label: "Inactive" },
];

// Convert DB patient to list format
function dbPatientToListItem(patient: DbPatient): Patient {
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

// Convert DB data to detail format
function createPatientDetail(
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

  // Map service types to more descriptive titles
  const getActivityTitle = (serviceType: string): string => {
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
  };

  // Generate a descriptive summary based on appointment data
  const getActivityDescription = (appointment: Appointment, patientName: string): string => {
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
  };

  // Generate visit summary details for the sliding panel
  const getVisitSummaryDetails = (serviceType: string, patientName: string, duration?: number) => {
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
      nextSteps:
        nextSteps[serviceType] || `Continue current treatment plan and schedule follow-up.`,
    };
  };

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
          .filter((a) => a.status === "Completed")
          .slice(0, 5)
          .map((a) => {
            const details = getVisitSummaryDetails(
              a.service_type,
              patient.first_name,
              a.duration_minutes
            );
            return {
              id: a.id,
              title: getActivityTitle(a.service_type),
              description: getActivityDescription(a, patient.first_name),
              date: new Date(a.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              visitSummary: a.notes || details.treatmentNotes,
              duration: details.duration,
              provider: details.provider,
              appointmentType: a.service_type,
              diagnosisCodes: details.diagnosisCodes,
              treatmentNotes: details.treatmentNotes,
              nextSteps: details.nextSteps,
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
    sender: m.sender,
    messageBody: m.message_body,
    isRead: m.is_read,
    sentAt: m.sent_at,
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
function dbActionToUiAction(action: PatientPriorityAction): PriorityAction {
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

interface PatientsPageProps {
  initialPatientId?: string;
  initialPatientName?: string;
  initialTab?: string;
}

export function PatientsPage({
  initialPatientId,
  initialPatientName,
  initialTab,
}: PatientsPageProps) {
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [activeFilter, setActiveFilter] = React.useState("all");

  // Stabilize props for effect dependencies
  const patientIdKey = initialPatientId ?? "";
  const patientNameKey = initialPatientName ?? "";

  // Use React Query for database population check
  const { data: dbReady = null, isLoading: dbCheckLoading } = useIsDatabasePopulated();

  // Use React Query for patients list
  const { data: patients = [], isLoading: patientsLoading } = usePatients();

  // Combined loading state
  const loading = dbCheckLoading || patientsLoading;

  // Select patient from URL param or default to first patient when data loads
  React.useEffect(() => {
    if (loading || !dbReady || patients.length === 0) return;
    if (selectedPatient) return; // Already selected

    let targetPatient: DbPatient | undefined;

    if (patientNameKey) {
      const searchName = patientNameKey.toLowerCase();
      // Try exact match first
      targetPatient = patients.find((p) => {
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
        return fullName === searchName;
      });
      // Try starts-with match for partial names
      if (!targetPatient) {
        targetPatient = patients.find((p) => {
          const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
          return fullName.startsWith(searchName);
        });
      }
      // Try first name only match
      if (!targetPatient) {
        targetPatient = patients.find((p) => {
          return p.first_name.toLowerCase() === searchName;
        });
      }
    } else if (patientIdKey) {
      targetPatient = patients.find((p) => p.id === patientIdKey);
    }

    if (targetPatient) {
      setSelectedPatient(dbPatientToListItem(targetPatient));
    } else if (patients[0]) {
      setSelectedPatient(dbPatientToListItem(patients[0]));
    }
  }, [loading, dbReady, patients, patientIdKey, patientNameKey, selectedPatient]);

  // Use React Query for patient details
  const selectedPatientId = selectedPatient?.id ?? "";
  const { data: patientDetailsData, isLoading: detailsLoading } =
    usePatientDetails(selectedPatientId);
  const { data: visitSummaries = [] } = usePatientVisitSummaries(selectedPatientId);
  const { data: priorityActionsData = [] } = usePatientPriorityActions(selectedPatientId);

  // Combine all data into PatientDetail format
  const patientDetails = React.useMemo(() => {
    if (!patientDetailsData || !selectedPatient) return null;

    const detailData = createPatientDetail(
      patientDetailsData.patient,
      patientDetailsData.appointments,
      patientDetailsData.invoices,
      visitSummaries,
      patientDetailsData.messages,
      patientDetailsData.outcomeMeasures,
      patientDetailsData.reviews
    );
    // Add priority actions to the detail data
    detailData.prioritizedActions = priorityActionsData.map(dbActionToUiAction);
    return detailData;
  }, [patientDetailsData, visitSummaries, priorityActionsData, selectedPatient]);

  const detailLoading = detailsLoading;

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  // Convert patients for list
  const patientListItems = patients.map(dbPatientToListItem);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-12">
          {/* Patient List Column Skeleton */}
          <div className="flex min-h-0 flex-col lg:col-span-5 xl:col-span-4">
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-16 rounded-full" />
              <Skeleton className="h-9 w-14 rounded-full" />
            </div>
            <CardWrapper className="flex-1 p-4">
              <Skeleton className="mb-4 h-10 w-full rounded-lg" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <PatientCardSkeleton key={i} />
                ))}
              </div>
            </CardWrapper>
          </div>
          {/* Patient Detail Column Skeleton */}
          <div className="flex min-h-0 flex-col lg:col-span-7 xl:col-span-8">
            <div className="mb-4 flex justify-end">
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
            <CardWrapper className="flex-1 p-6">
              <div className="mb-6 flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-7 w-48" />
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
              <Skeleton className="mt-6 h-8 w-full" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </CardWrapper>
          </div>
        </div>
      </div>
    );
  }

  // Empty state (no patients after loading)
  if (patientListItems.length === 0 && dbReady) {
    return (
      <div className="flex h-full flex-col">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-12">
          <div className="flex min-h-0 flex-col lg:col-span-5 xl:col-span-4">
            <div className="mb-4 flex items-center justify-between">
              <FilterTabs
                tabs={patientFilterTabs}
                activeTab={activeFilter}
                onTabChange={setActiveFilter}
              />
            </div>
            <CardWrapper className="flex flex-1 flex-col items-center justify-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Users className="h-7 w-7 text-gray-400" />
              </div>
              <Text size="sm" className="mb-1 font-semibold">
                No Patients Found
              </Text>
              <Text size="xs" muted className="mb-4 text-center">
                {activeFilter !== "all"
                  ? `No ${activeFilter} patients in your practice.`
                  : "Add your first patient to get started."}
              </Text>
              <Button size="sm">Add Patient</Button>
            </CardWrapper>
          </div>
          <div className="flex min-h-0 flex-col lg:col-span-7 xl:col-span-8">
            <div className="mb-4 flex items-center justify-end">
              <Button className="gap-1.5 text-sm sm:gap-2 sm:text-base">
                Add Patient
                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <CardWrapper className="flex flex-1 items-center justify-center">
              <Text muted>Select a patient to view details</Text>
            </CardWrapper>
          </div>
        </div>
      </div>
    );
  }

  // Database not ready state
  if (dbReady === false) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <Database className="text-muted-foreground/50 h-12 w-12" />
          <Text size="sm" muted className="mt-4 text-center">
            No patient data imported yet.
          </Text>
          <Text size="xs" muted className="mt-1 max-w-sm text-center">
            Run the import wizard to populate the database with patient data.
          </Text>
          <Link href="/import" prefetch={true} className="mt-4">
            <Button variant="default" size="sm">
              Start Import
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Main Content */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-12">
        {/* Patient List Column */}
        <div className="flex min-h-0 flex-col lg:col-span-5 xl:col-span-4">
          {/* Filter Tabs - aligned with patient list column */}
          <div className="mb-4 flex items-center justify-between">
            <FilterTabs
              tabs={patientFilterTabs}
              activeTab={activeFilter}
              onTabChange={setActiveFilter}
            />
          </div>
          <PatientListSidebar
            patients={patientListItems}
            selectedPatientId={selectedPatient?.id}
            onPatientSelect={handlePatientSelect}
            activeFilter={activeFilter}
            className="min-h-0 flex-1"
          />
        </div>

        {/* Patient Detail Column */}
        <div className="flex min-h-0 flex-col lg:col-span-7 xl:col-span-8">
          {/* Add Patient Button - aligned with detail view */}
          <div className="mb-4 flex items-center justify-end">
            <Button className="gap-1.5 text-sm sm:gap-2 sm:text-base">
              Add Patient
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
          {detailLoading ? (
            <CardWrapper className="min-h-0 flex-1 p-6">
              <div className="mb-6 flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-7 w-48" />
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
              <Skeleton className="mt-6 h-10 w-full rounded-lg" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </CardWrapper>
          ) : (
            <PatientDetailView
              patient={patientDetails}
              className="min-h-0 flex-1"
              initialTab={initialTab}
            />
          )}
        </div>
      </div>
    </div>
  );
}
