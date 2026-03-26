/**
 * Visit Prep Data Logic
 * Pure data functions for building visit preparation context from patient data
 */

import type { AppointmentWithPatient } from "@/src/lib/queries/appointments";
import { PATIENTS as SYNTHETIC_PATIENTS } from "@/src/lib/data/patients";
import { PRIORITY_ACTIONS as SYNTHETIC_PRIORITY_ACTIONS } from "@/src/lib/data/priority-actions";
import { APPOINTMENTS } from "@/src/lib/data/appointments";
import { getExternalIdFromUUID } from "@/src/lib/data/adapter";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PrepData {
  // Section 1: Current Situation
  visitDescription: string;
  dxCode: string;
  dxName: string;
  scoreMeasure: string;
  scoreCurrent: number;
  severity: string;
  recentMedChange: string | null;
  // Section 2: Key Background
  referralSource: string;
  therapyType: string;
  therapySince: string;
  techniques: string[];
  // Section 3: Care Plan
  medications: { name: string; dosage: string; prescriber: string }[];
  goalsSummary: string;
  goals: { label: string; status: "On Track" | "Partial" | "Not Started" }[];
  // Section 4: Progress
  scorePrev: number;
  scoreDays: number;
  direction: "improving" | "worsening" | "stable";
  alerts: string[];
}

// ─── Data Maps ──────────────────────────────────────────────────────────────

export const therapyMap: Record<string, { type: string; techniques: string[] }> = {
  "F41.1": { type: "CBT", techniques: ["Cognitive restructuring", "Exposure", "Relaxation"] },
  "F33.1": {
    type: "CBT + BA",
    techniques: ["Activity scheduling", "Thought records", "Mindfulness"],
  },
  "F32.1": {
    type: "CBT + BA",
    techniques: ["Activity scheduling", "Thought records", "Mindfulness"],
  },
  "F43.10": {
    type: "CPT / PE",
    techniques: ["Cognitive processing", "Exposure therapy", "Grounding"],
  },
  "F31.81": {
    type: "DBT-informed",
    techniques: ["Mood tracking", "Distress tolerance", "Interpersonal"],
  },
  "F50.2": {
    type: "CBT-E",
    techniques: ["Food diary", "Body image work", "Behavioral experiments"],
  },
  "F64.0": {
    type: "Affirmative",
    techniques: ["Identity exploration", "Family systems", "Resilience"],
  },
  "F10.20": {
    type: "MI + CBT",
    techniques: ["Motivational interviewing", "Relapse prevention", "Coping"],
  },
  "F40.10": {
    type: "Exposure + CBT",
    techniques: ["Exposure hierarchy", "Restructuring", "Breathing"],
  },
};

export const referralSources = [
  "Self-referred",
  "PCP referral",
  "Referred via EAP",
  "Insurance referral",
  "Family referral",
  "Previous provider",
];

export const goalsByDx: Record<
  string,
  { label: string; status: "On Track" | "Partial" | "Not Started" }[]
> = {
  "F41.1": [
    { label: "Reduce anxiety symptoms", status: "On Track" },
    { label: "Improve stress coping", status: "Partial" },
    { label: "Decrease avoidance", status: "On Track" },
  ],
  "F33.1": [
    { label: "Improve mood stability", status: "On Track" },
    { label: "Increase social engagement", status: "Partial" },
    { label: "Maintain sleep hygiene", status: "On Track" },
  ],
  "F43.10": [
    { label: "Process traumatic memories", status: "On Track" },
    { label: "Reduce hypervigilance", status: "Partial" },
    { label: "Improve daily functioning", status: "On Track" },
  ],
  "F32.1": [
    { label: "Improve mood stability", status: "On Track" },
    { label: "Increase activity levels", status: "Partial" },
    { label: "Strengthen coping skills", status: "Not Started" },
  ],
};

// ─── Builder ────────────────────────────────────────────────────────────────

export function buildPrepData(apt: AppointmentWithPatient): PrepData {
  const patientId = apt.patient.id;
  const externalId = getExternalIdFromUUID(patientId) || patientId;
  const fullPatient = SYNTHETIC_PATIENTS.find((p) => p.id === externalId || p.id === patientId);
  const priorityActions = SYNTHETIC_PRIORITY_ACTIONS.filter(
    (pa) => pa.patient_id === externalId && pa.status === "pending"
  );

  const dxCode = fullPatient?.primary_diagnosis_code || "F41.1";
  const dxName = fullPatient?.primary_diagnosis_name || "Generalized Anxiety Disorder";
  const riskLevel = apt.patient.risk_level || "low";
  const medications = fullPatient?.medications || [];
  const treatmentStart = fullPatient?.treatment_start_date || "2025-06-01";
  const hash = patientId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  // Score data
  const scoreBase = riskLevel === "high" ? 16 : riskLevel === "medium" ? 11 : 7;
  const scoreCurrent = Math.max(3, scoreBase - (hash % 5));
  const scorePrev = scoreCurrent + 2 + (hash % 4);
  const scoreMeasure = dxCode.startsWith("F43")
    ? "PCL-5"
    : dxCode.startsWith("F41")
      ? "GAD-7"
      : "PHQ-9";
  const maxScore = scoreMeasure === "PCL-5" ? 80 : scoreMeasure === "GAD-7" ? 21 : 27;
  const severity =
    scoreCurrent / maxScore > 0.6
      ? "Severe"
      : scoreCurrent / maxScore > 0.4
        ? "Moderate"
        : scoreCurrent / maxScore > 0.2
          ? "Mild"
          : "Minimal";
  const direction: PrepData["direction"] =
    scoreCurrent < scorePrev ? "improving" : scoreCurrent > scorePrev ? "worsening" : "stable";
  const scoreDays = 30 + (hash % 30);

  // Dates
  const lastAppt =
    APPOINTMENTS.filter((a) => a.patient_id === externalId && a.status === "Completed").sort(
      (a, b) => b.date.localeCompare(a.date)
    )[0]?.date || "2026-01-28";
  const lastSeenStr = new Date(lastAppt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const startDate = new Date(treatmentStart);
  const therapySinceStr = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const therapy = therapyMap[dxCode] || therapyMap["F41.1"]!;
  const refSource = referralSources[hash % referralSources.length]!;

  // Recent med change
  const recentMedChange = medications.length > 0 ? `Current: ${medications[0]}` : null;

  // Goals
  const goals = goalsByDx[dxCode] || [
    { label: "Symptom reduction", status: "On Track" as const },
    { label: "Improve coping skills", status: "Partial" as const },
    { label: "Enhance functioning", status: "On Track" as const },
  ];
  const onTrack = goals.filter((g) => g.status === "On Track").length;
  const partial = goals.filter((g) => g.status === "Partial").length;
  const notStarted = goals.filter((g) => g.status === "Not Started").length;
  const goalParts = [];
  if (onTrack) goalParts.push(`${onTrack} on track`);
  if (partial) goalParts.push(`${partial} partial`);
  if (notStarted) goalParts.push(`${notStarted} not started`);

  // Alerts
  const alerts = priorityActions
    .filter((pa) => pa.urgency === "urgent" || pa.urgency === "high")
    .map((pa) => pa.title)
    .slice(0, 2);

  return {
    visitDescription: `Follow-up ${apt.service_type.toLowerCase()}, last seen ${lastSeenStr}. Active dx: ${dxCode}.`,
    dxCode,
    dxName,
    scoreMeasure,
    scoreCurrent,
    severity,
    recentMedChange,
    referralSource: refSource,
    therapyType: therapy.type,
    therapySince: therapySinceStr,
    techniques: therapy.techniques,
    medications: medications.map((med) => {
      const medParts = med.split(" ");
      return {
        name: medParts.slice(0, -1).join(" ") || med,
        dosage: medParts[medParts.length - 1] || "",
        prescriber: "Dr. Demo",
      };
    }),
    goalsSummary: `${goals.length} goals: ${goalParts.join(", ")}`,
    goals,
    scorePrev,
    scoreDays,
    direction,
    alerts,
  };
}
