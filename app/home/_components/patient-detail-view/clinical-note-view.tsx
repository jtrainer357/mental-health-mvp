"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { cn } from "@/design-system/lib/utils";
import { smoothEase } from "@/design-system/lib/animation-constants";
import { usePatientViewNavigation, useViewState } from "@/src/lib/stores/patient-view-store";
import type { PatientDetail } from "./types";
import type { SelectedActivity } from "./types";

// Sub-components
import { ClinicalNoteSidebar } from "./clinical-note-sidebar";
import { ClinicalNoteHeader } from "./clinical-note-header";
import { DAPSection, type NoteSection } from "./dap-section";
import { CptApprovalCard } from "./cpt-approval-card";
import { ExtractedActionsCard } from "./extracted-actions-card";
import { ClinicalNoteFooter } from "./clinical-note-footer";

// ─── Animation ───────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: smoothEase },
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExtractedAction {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  requiresApproval?: boolean;
}

interface ClinicalNoteViewProps {
  activity: SelectedActivity;
  patientName: string;
  patient?: PatientDetail;
  className?: string;
}

// ─── Data helpers ────────────────────────────────────────────────────────────

function getSessionNumber(activity: SelectedActivity, patient?: PatientDetail): number {
  if (!patient?.recentActivity) return 1;
  const sorted = [...patient.recentActivity].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const idx = sorted.findIndex((a) => a.id === activity.id);
  return idx >= 0 ? idx + 1 : patient.recentActivity.length;
}

function getDAPContent(activity?: SelectedActivity): NoteSection[] {
  // Blank note for new session — empty sections awaiting voice input
  if (activity?.id === "new-session") {
    return [
      {
        key: "data",
        label: "DATA",
        prefix: "D",
        status: "machine-generated",
        content: "Session recording will populate this section. Tap Begin Listening to start.",
      },
      {
        key: "assessment",
        label: "ASSESSMENT",
        prefix: "A",
        status: "machine-generated",
        content: "Assessment will be generated from session recording.",
      },
      {
        key: "plan",
        label: "PLAN",
        prefix: "P",
        status: "machine-generated",
        content: ["Awaiting session recording...", "—", "—"].join("\n"),
      },
    ];
  }

  // Use real SOAP data if available, mapping S+O→Data, A→Assessment, P→Plan
  if (activity?.subjective && activity?.objective) {
    return [
      {
        key: "data",
        label: "DATA",
        prefix: "D",
        status: "machine-generated",
        content: activity.subjective + "\n\n" + activity.objective,
      },
      {
        key: "assessment",
        label: "ASSESSMENT",
        prefix: "A",
        status: activity.noteStatus === "signed" ? "accepted" : "human-edited",
        content: activity.assessment || "Assessment pending.",
      },
      {
        key: "plan",
        label: "PLAN",
        prefix: "P",
        status: "machine-generated",
        content: activity.plan || "Plan pending.",
      },
    ];
  }

  // Fallback: generic content
  return [
    {
      key: "data",
      label: "DATA",
      prefix: "D",
      status: "machine-generated",
      content:
        "Patient presented for follow-up individual therapy via telehealth. Reports reduced frequency of anxious episodes since implementing RAIN technique (1\u20132\u00d7/week vs. 4\u20135\u00d7/week at intake). Sleep improved to 6\u20137 hrs/night. Continued workplace trigger management; described ongoing tension with direct supervisor as primary stressor. Denied current SI/HI.",
    },
    {
      key: "assessment",
      label: "ASSESSMENT",
      prefix: "A",
      status: "human-edited",
      content:
        "GAD symptoms improving. PHQ-9 decreased from 12 \u2192 8 (Mild). Medication stable on Fluoxetine 40mg. Patient also reports better sleep quality since starting RAIN practice. Increasing engagement with CBT techniques noted.",
    },
    {
      key: "plan",
      label: "PLAN",
      prefix: "P",
      status: "machine-generated",
      content: [
        "Continue weekly individual therapy",
        "Maintain Fluoxetine 40mg",
        "Practice RAIN technique daily",
        "Reduce panic attacks to <1/week (Target: Mar 28, 2026)",
        "Engage in 2 avoided situations/week",
      ].join("\n"),
    },
  ];
}

function getExtractedActions(): ExtractedAction[] {
  return [
    {
      id: "act-1",
      title: "Schedule next session",
      description: "Weekly individual therapy \u2014 next available slot based on current cadence",
      checked: false,
    },
    {
      id: "act-2",
      title: "Send post-session summary to patient",
      description:
        "Patient-facing summary drafted from session content \u2014 review before sending via SMS/portal",
      checked: false,
    },
    {
      id: "act-3",
      title: "Update problem list",
      description:
        "Substrate extracted potential chart updates from session content. Provider review required before changes are written to the patient record.",
      checked: false,
      requiresApproval: true,
    },
    {
      id: "act-4",
      title: "Generate patient payment link",
      description:
        "One-click Apple Pay / credit card link for session balance, staged for SMS delivery on note approval",
      checked: false,
    },
  ];
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ClinicalNoteView({
  activity,
  patientName,
  patient,
  className,
}: ClinicalNoteViewProps) {
  const viewState = useViewState();
  const { goBack, toggleFullView } = usePatientViewNavigation();
  const isFullView = viewState === "fullView";

  const sessionNum = getSessionNumber(activity, patient);
  const sections = getDAPContent(activity);
  const [actions, setActions] = React.useState(getExtractedActions);
  const [cptApproved, setCptApproved] = React.useState(false);
  const [noteType, setNoteType] = React.useState("dap");

  const otherVisits =
    patient?.recentActivity?.filter((a) => a.id !== activity.id).slice(0, 3) || [];

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullView) {
        event.preventDefault();
        toggleFullView();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullView, toggleFullView]);

  const toggleAction = (id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a)));
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <motion.div className={cn("flex flex-col", className)} initial="hidden" animate="visible">
      {/* Header */}
      <ClinicalNoteHeader
        patientName={patientName}
        avatarSrc={patient?.avatarSrc}
        activity={activity}
        sessionNumber={sessionNum}
        isFullView={isFullView}
        onToggleFullView={toggleFullView}
        onBack={goBack}
        provider={patient?.provider}
      />

      {/* Two-column layout */}
      <div
        className={cn("flex-1 pb-20 md:pb-0", isFullView && "flex flex-col gap-2 px-4 lg:flex-row")}
      >
        {/* Left: Patient Context Sidebar */}
        {isFullView && patient && (
          <ClinicalNoteSidebar
            patient={patient}
            activity={activity}
            sessionNum={sessionNum}
            otherVisits={otherVisits}
          />
        )}

        {/* Center: Session Note */}
        <div className="flex min-w-0 flex-1 flex-col">
          <CardWrapper
            className={cn(
              "flex flex-1 flex-col space-y-5",
              !isFullView && "border-0 bg-transparent px-0 shadow-none backdrop-blur-none"
            )}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={cn("space-y-5", activity.id === "new-session" && "flex flex-1 flex-col")}
            >
              {/* DAP Sections */}
              {sections.map((section) => (
                <DAPSection
                  key={section.key}
                  section={section}
                  noteType={noteType}
                  onNoteTypeChange={section.key === "data" ? setNoteType : undefined}
                  isNewSession={activity.id === "new-session"}
                />
              ))}

              {/* CPT + Extracted Actions side by side */}
              <motion.div
                variants={sectionVariants}
                className={cn(
                  "grid grid-cols-1 gap-2 lg:grid-cols-2",
                  activity.id === "new-session" && "mt-auto"
                )}
              >
                <CptApprovalCard
                  activity={activity}
                  cptApproved={cptApproved}
                  onToggleApproval={() => setCptApproved(true)}
                />
                <ExtractedActionsCard
                  actions={actions}
                  onToggleAction={toggleAction}
                  isNewSession={activity.id === "new-session"}
                />
              </motion.div>
            </motion.div>
          </CardWrapper>
        </div>
      </div>

      {/* Footer — outside scroll container, always visible at bottom (hidden for new sessions) */}
      {activity.id !== "new-session" && <ClinicalNoteFooter isFullView={isFullView} />}
    </motion.div>
  );
}
