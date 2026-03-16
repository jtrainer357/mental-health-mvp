"use client";

import { ArrowLeft } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";
import { Heading, Text } from "@/design-system/components/ui/typography";
import type { PatientDetail } from "./types";

// Type for selected activity with full details
type SelectedActivity = PatientDetail["recentActivity"][number];

interface FullNoteViewProps {
  activity: SelectedActivity;
  patientName: string;
  onBack: () => void;
}

// Generate realistic SOAP note content based on session type
function getNoteContent(activity: SelectedActivity, patientName: string) {
  const isSubstanceUse =
    activity.title?.toLowerCase().includes("substance") ||
    activity.diagnosisCodes?.some((c) => c.toLowerCase().includes("substance"));

  if (isSubstanceUse || activity.appointmentType === "Individual Therapy") {
    return {
      chiefComplaint:
        "Follow-up for ongoing individual therapy, mood management, and coping skills development.",
      subjective: `Patient reports: "I've been doing better this week. The techniques we discussed last session really helped when I felt triggered." Patient describes improved sleep quality (6-7 hours/night vs 4-5 previously). Denies any return to substance use. Reports attending 2 support group meetings this week. Mood described as "mostly stable with some anxiety around work deadlines." No suicidal or homicidal ideation. Appetite normal. Energy levels improving.`,
      objective: `Patient arrived on time, appropriately dressed with good hygiene. Alert and oriented x4. Speech normal rate/rhythm/volume. Mood: "better." Affect: congruent, full range, appropriate. Thought process: linear, goal-directed. No evidence of psychosis, delusions, or hallucinations. Insight: good. Judgment: intact. Eye contact appropriate throughout session.`,
      assessment: `${patientName} continues to make progress in treatment. Demonstrates improved coping skills and increased insight into triggers. Sustained recovery maintained. GAD symptoms showing improvement with current interventions. Patient remains engaged and motivated in treatment.`,
      plan: [
        "Continue individual therapy weekly x 4 sessions",
        "Maintain current coping strategies (mindfulness, journaling, sponsor contact)",
        "Continue support group attendance (minimum 2x/week)",
        "Practice grounding techniques discussed today",
        "Review sleep hygiene handout provided",
        "Next appointment scheduled in 1 week",
      ],
      diagnoses: [
        "F10.20 - Alcohol Use Disorder, Moderate, In Sustained Remission",
        "F41.1 - Generalized Anxiety Disorder",
      ],
      vitals: {
        bp: "122/78",
        hr: "72",
        phq9: "8 (mild)",
        gad7: "10 (moderate)",
      },
    };
  }

  // Default therapy note
  return {
    chiefComplaint: "Scheduled follow-up for ongoing psychotherapy and symptom management.",
    subjective: `Patient reports overall improvement since last session. Describes practicing coping techniques discussed previously with moderate success. Sleep and appetite within normal limits. Denies suicidal or homicidal ideation. Reports some ongoing stressors related to work/family but feels better equipped to manage them.`,
    objective: `Patient arrived on time, casually dressed, good hygiene. Alert and oriented x4. Cooperative and engaged throughout session. Mood: "okay." Affect: appropriate, full range. Thought process: linear and goal-directed. No evidence of psychosis. Insight and judgment intact.`,
    assessment: `Patient demonstrates continued engagement in treatment and progress toward therapeutic goals. Current symptoms are well-managed with existing treatment approach.`,
    plan: [
      "Continue current treatment approach",
      "Practice techniques discussed in session",
      "Schedule follow-up appointment",
    ],
    diagnoses: ["F41.1 - Generalized Anxiety Disorder"],
    vitals: {
      phq9: "6 (mild)",
      gad7: "8 (mild)",
    },
  };
}

export function FullNoteView({ activity, patientName, onBack }: FullNoteViewProps) {
  const note = getNoteContent(activity, patientName);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Go back to visit summary"
            className="hover:bg-muted flex h-11 w-11 items-center justify-center rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <Heading level={5} className="text-base sm:text-lg">
              Clinical Note
            </Heading>
            <Text size="sm" muted>
              {activity.title} - {activity.date}
            </Text>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          Signed & Locked
        </Badge>
      </div>

      {/* Note Content */}
      <div className="flex-1 space-y-5 pb-20 lg:overflow-y-auto lg:pb-0">
        {/* Patient & Session Info */}
        <Card className="bg-muted/30 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div>
              <Text size="xs" muted>
                Patient
              </Text>
              <Text size="sm" className="font-medium">
                {patientName}
              </Text>
            </div>
            <div>
              <Text size="xs" muted>
                Date of Service
              </Text>
              <Text size="sm" className="font-medium">
                {activity.date}
              </Text>
            </div>
            <div>
              <Text size="xs" muted>
                Provider
              </Text>
              <Text size="sm" className="font-medium">
                {activity.provider || "Dr. Demo"}
              </Text>
            </div>
            <div>
              <Text size="xs" muted>
                Duration
              </Text>
              <Text size="sm" className="font-medium">
                {activity.duration || "60 min"}
              </Text>
            </div>
          </div>
        </Card>

        {/* Vitals / Assessments */}
        {note.vitals && (
          <div>
            <Text size="sm" className="mb-2 font-semibold text-stone-500">
              CLINICAL MEASURES
            </Text>
            <Card className="p-4">
              <div className="flex flex-wrap gap-4">
                {note.vitals.bp && (
                  <div className="flex items-center gap-2">
                    <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full">
                      <Text size="xs" className="font-medium">
                        BP
                      </Text>
                    </div>
                    <Text size="sm">{note.vitals.bp} mmHg</Text>
                  </div>
                )}
                {note.vitals.hr && (
                  <div className="flex items-center gap-2">
                    <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full">
                      <Text size="xs" className="font-medium">
                        HR
                      </Text>
                    </div>
                    <Text size="sm">{note.vitals.hr} bpm</Text>
                  </div>
                )}
                {note.vitals.phq9 && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 items-center justify-center rounded-full bg-blue-100 px-2.5">
                      <Text size="xs" className="font-medium text-blue-700">
                        PHQ-9
                      </Text>
                    </div>
                    <Text size="sm">{note.vitals.phq9}</Text>
                  </div>
                )}
                {note.vitals.gad7 && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 items-center justify-center rounded-full bg-teal-100 px-2.5">
                      <Text size="xs" className="font-medium text-teal-700">
                        GAD-7
                      </Text>
                    </div>
                    <Text size="sm">{note.vitals.gad7}</Text>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Chief Complaint */}
        <div>
          <Text size="sm" className="mb-2 font-semibold text-stone-500">
            CHIEF COMPLAINT
          </Text>
          <Text size="sm" className="leading-relaxed">
            {note.chiefComplaint}
          </Text>
        </div>

        {/* Subjective */}
        <div>
          <Text size="sm" className="mb-2 font-semibold text-stone-500">
            SUBJECTIVE
          </Text>
          <Card className="p-4">
            <Text size="sm" className="leading-relaxed whitespace-pre-wrap">
              {note.subjective}
            </Text>
          </Card>
        </div>

        {/* Objective */}
        <div>
          <Text size="sm" className="mb-2 font-semibold text-stone-500">
            OBJECTIVE
          </Text>
          <Card className="p-4">
            <Text size="sm" className="leading-relaxed">
              {note.objective}
            </Text>
          </Card>
        </div>

        {/* Assessment */}
        <div>
          <Text size="sm" className="mb-2 font-semibold text-stone-500">
            ASSESSMENT
          </Text>
          <Card className="p-4">
            <Text size="sm" className="mb-3 leading-relaxed">
              {note.assessment}
            </Text>
            <div className="border-t pt-3">
              <Text size="xs" muted className="mb-2">
                Diagnoses:
              </Text>
              <div className="space-y-1">
                {note.diagnoses.map((dx, i) => (
                  <Text key={i} size="sm" className="font-mono text-xs">
                    {dx}
                  </Text>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Plan */}
        <div>
          <Text size="sm" className="mb-2 font-semibold text-stone-500">
            PLAN
          </Text>
          <Card className="p-4">
            <ul className="space-y-2">
              {note.plan.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {i + 1}
                  </span>
                  <Text size="sm">{item}</Text>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Signature */}
        <Card className="bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <Text size="sm" className="font-medium">
                Electronically signed by {activity.provider || "Dr. Demo"}
              </Text>
              <Text size="xs" muted>
                {activity.date} at 4:32 PM
              </Text>
            </div>
            <Badge className="bg-green-100 text-green-700">Verified</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
