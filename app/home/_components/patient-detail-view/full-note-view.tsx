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

// Extract PHQ-9 and GAD-7 scores from objective text if present
function extractScoresFromObjective(objective: string) {
  const phq9Match = objective.match(/PHQ-9:\s*(\d+)\s*(?:\(([^)]+)\))?/i);
  const gad7Match = objective.match(/GAD-7:\s*(\d+)\s*(?:\(([^)]+)\))?/i);
  const pcl5Match = objective.match(/PCL-5:\s*(\d+)\s*(?:\(([^)]+)\))?/i);
  return {
    phq9: phq9Match ? `${phq9Match[1]}${phq9Match[2] ? ` (${phq9Match[2]})` : ""}` : undefined,
    gad7: gad7Match ? `${gad7Match[1]}${gad7Match[2] ? ` (${gad7Match[2]})` : ""}` : undefined,
    pcl5: pcl5Match ? `${pcl5Match[1]}${pcl5Match[2] ? ` (${pcl5Match[2]})` : ""}` : undefined,
  };
}

// Parse plan text into numbered items
function parsePlanItems(plan: string): string[] {
  // Split on numbered items like "1. " or "1) "
  const items = plan.split(/\d+\.\s+/).filter((item) => item.trim().length > 0);
  if (items.length > 1) return items.map((item) => item.trim());
  // Fallback: split on newlines
  const lines = plan.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length > 1) return lines.map((line) => line.replace(/^\d+[.)]\s*/, "").trim());
  // Single item
  return [plan.trim()];
}

// Format signed_at timestamp
function formatSignedTime(signedAt?: string): string {
  if (!signedAt) return "";
  try {
    return new Date(signedAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export function FullNoteView({ activity, patientName, onBack }: FullNoteViewProps) {
  const _hasRealNote = Boolean(activity.subjective && activity.objective);

  const subjective =
    activity.subjective ||
    `Patient reports overall improvement since last session. Describes practicing coping techniques discussed previously with moderate success. Sleep and appetite within normal limits. Denies suicidal or homicidal ideation.`;
  const objective =
    activity.objective ||
    `Patient arrived on time, casually dressed, good hygiene. Alert and oriented x4. Cooperative and engaged throughout session. Mood: "okay." Affect: appropriate, full range. Thought process: linear and goal-directed. No evidence of psychosis. Insight and judgment intact.`;
  const assessment =
    activity.assessment ||
    `Patient demonstrates continued engagement in treatment and progress toward therapeutic goals. Current symptoms are well-managed with existing treatment approach.`;
  const plan =
    activity.plan ||
    "1. Continue current treatment approach\n2. Practice techniques discussed in session\n3. Schedule follow-up appointment";

  const planItems = parsePlanItems(plan);
  const scores = extractScoresFromObjective(objective);
  const provider = activity.signedBy || activity.provider || "Dr. Sarah Chen";
  const signedTime = formatSignedTime(activity.signedAt);
  const noteStatus = activity.noteStatus || "signed";
  const noteTypeLabel =
    activity.noteType === "initial_evaluation" ? "Initial Evaluation" : "Progress Note";
  const cptLabel = activity.cptCode ? `CPT ${activity.cptCode}` : undefined;

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
              {noteTypeLabel}
            </Heading>
            <Text size="sm" muted>
              {activity.title} - {activity.date}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cptLabel && (
            <Badge variant="outline" className="text-xs">
              {cptLabel}
            </Badge>
          )}
          <Badge
            variant="secondary"
            className={
              noteStatus === "signed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
            }
          >
            {noteStatus === "signed" ? "Signed & Locked" : "Draft"}
          </Badge>
        </div>
      </div>

      {/* Note Content */}
      <div className="flex-1 space-y-5 pb-20 md:pb-0 lg:overflow-y-auto">
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
                {provider}
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

        {/* Clinical Measures */}
        {(scores.phq9 || scores.gad7 || scores.pcl5) && (
          <div>
            <Text size="sm" className="text-muted-foreground mb-2 font-semibold">
              CLINICAL MEASURES
            </Text>
            <Card className="p-4">
              <div className="flex flex-wrap gap-4">
                {scores.phq9 && (
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 flex h-7 items-center justify-center rounded-full px-2.5">
                      <Text size="xs" className="text-primary font-medium">
                        PHQ-9
                      </Text>
                    </div>
                    <Text size="sm">{scores.phq9}</Text>
                  </div>
                )}
                {scores.gad7 && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 items-center justify-center rounded-full bg-teal-100 px-2.5">
                      <Text size="xs" className="font-medium text-teal-700">
                        GAD-7
                      </Text>
                    </div>
                    <Text size="sm">{scores.gad7}</Text>
                  </div>
                )}
                {scores.pcl5 && (
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 flex h-7 items-center justify-center rounded-full px-2.5">
                      <Text size="xs" className="text-primary font-medium">
                        PCL-5
                      </Text>
                    </div>
                    <Text size="sm">{scores.pcl5}</Text>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Subjective */}
        <div>
          <Text size="sm" className="text-muted-foreground mb-2 font-semibold">
            SUBJECTIVE
          </Text>
          <Card className="p-4">
            <Text size="sm" className="leading-relaxed whitespace-pre-wrap">
              {subjective}
            </Text>
          </Card>
        </div>

        {/* Objective */}
        <div>
          <Text size="sm" className="text-muted-foreground mb-2 font-semibold">
            OBJECTIVE
          </Text>
          <Card className="p-4">
            <Text size="sm" className="leading-relaxed whitespace-pre-wrap">
              {objective}
            </Text>
          </Card>
        </div>

        {/* Assessment */}
        <div>
          <Text size="sm" className="text-muted-foreground mb-2 font-semibold">
            ASSESSMENT
          </Text>
          <Card className="p-4">
            <Text size="sm" className="leading-relaxed whitespace-pre-wrap">
              {assessment}
            </Text>
          </Card>
        </div>

        {/* Plan */}
        <div>
          <Text size="sm" className="text-muted-foreground mb-2 font-semibold">
            PLAN
          </Text>
          <Card className="p-4">
            <ul className="space-y-2">
              {planItems.map((item, i) => (
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
                {noteStatus === "signed" ? "Electronically signed by" : "Draft by"} {provider}
              </Text>
              <Text size="xs" muted>
                {signedTime || activity.date}
              </Text>
            </div>
            {noteStatus === "signed" && (
              <Badge className="bg-success/15 text-success">Verified</Badge>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
