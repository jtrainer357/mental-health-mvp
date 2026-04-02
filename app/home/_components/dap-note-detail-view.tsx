"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DAPNoteSections {
  data: string;
  assessment: string;
  plan: string;
}

interface DAPNote {
  id: string;
  patientId: string;
  patientName: string;
  sessionDate: string;
  sessionDuration: number;
  provider: string;
  noteType: "DAP";
  status: "signed";
  sections: DAPNoteSections;
}

interface DAPNoteDetailViewProps {
  noteId: string;
  patientId: string;
  onBack: () => void;
  onEnterVisit: () => void;
}

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
};

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: smoothEase,
    },
  },
};

const headerVariants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: smoothEase,
    },
  },
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_NOTES: Record<string, DAPNote> = {
  "note-1": {
    id: "note-1",
    patientId: "patient-1",
    patientName: "Michael Harris",
    sessionDate: "March 12, 2026",
    sessionDuration: 50,
    provider: "Dr. Sarah Chen",
    noteType: "DAP",
    status: "signed",
    sections: {
      data: "Client arrived on time, appeared well-rested with improved affect compared to previous session. Reported improved sleep patterns (6-7 hours/night vs 4-5 previously). Successfully used breathing techniques during a stressful work presentation last week — described feeling \"more in control than I expected.\" Discussed upcoming family gathering scheduled for March 20th. Client expressed anxiety about potential triggers related to family dynamics, specifically interactions with father. Denies suicidal or homicidal ideation. Appetite normal. Energy levels continuing to improve.",
      assessment:
        "Michael continues to demonstrate meaningful progress in anxiety management. The successful application of breathing techniques in a real-world high-stress situation (work presentation) represents a significant milestone in treatment. His improved sleep patterns correlate with reduced GAD-7 scores. The upcoming family gathering represents a predictable stressor that warrants proactive planning. Current treatment approach remains effective; no medication adjustment indicated at this time. GAD-7: 10 (moderate, decreased from 14). PHQ-9: 12 (moderate, decreased from 16).",
      plan: "1. Continue weekly individual therapy sessions (90837)\n2. Develop specific coping plan for family gathering (exposure prep)\n3. Practice assertiveness scripts for identified trigger scenarios\n4. Continue daily breathing exercises (minimum 2x/day)\n5. Maintain sleep hygiene protocol\n6. Follow-up GAD-7/PHQ-9 at next session to track trajectory\n7. Next appointment: March 19, 2026 at 10:30 AM",
    },
  },
  "note-2": {
    id: "note-2",
    patientId: "patient-1",
    patientName: "Michael Harris",
    sessionDate: "March 5, 2026",
    sessionDuration: 50,
    provider: "Dr. Sarah Chen",
    noteType: "DAP",
    status: "signed",
    sections: {
      data: 'Client reported mixed week — two good days followed by increased anxiety around Thursday work deadline. Identified 3 automatic thoughts during cognitive restructuring exercise: "I\'ll definitely fail this presentation," "Everyone will notice I\'m anxious," "My boss thinks I\'m incompetent." Successfully reframed first two thoughts with therapist guidance. Completed thought record homework from last session for 4 of 7 days. Sleep remains disrupted (4-5 hours). Denies SI/HI.',
      assessment:
        "Client is engaging well with cognitive restructuring techniques but requires additional practice to internalize the skill independently. The automatic thoughts identified follow a consistent pattern of catastrophizing and mind-reading cognitive distortions. Partial completion of homework suggests motivation is present but may need simplified assignments. Sleep disruption continues to exacerbate anxiety symptoms — this remains a treatment priority.",
      plan: "1. Continue cognitive restructuring with focus on catastrophizing patterns\n2. Simplified homework: thought record for 3 situations (reduced from daily)\n3. Introduce sleep hygiene protocol (handout provided)\n4. Practice progressive muscle relaxation before bed\n5. Review breathing technique application for upcoming presentation\n6. Next appointment: March 12, 2026 at 10:30 AM",
    },
  },
  "note-3": {
    id: "note-3",
    patientId: "patient-1",
    patientName: "Michael Harris",
    sessionDate: "February 26, 2026",
    sessionDuration: 50,
    provider: "Dr. Sarah Chen",
    noteType: "DAP",
    status: "signed",
    sections: {
      data: "Introduced concept of exposure hierarchy for social anxiety. Client initially expressed resistance — \"I don't think I can do that.\" After psychoeducation about graduated exposure, client agreed to identify 10 anxiety-provoking social situations and rate them on SUDs scale. Completed hierarchy collaboratively in session. Lowest item (SUDs 20): saying hello to coworker in hallway. Highest item (SUDs 90): giving a presentation to department. Reviewed diaphragmatic breathing technique. Client demonstrated correct technique after 3 practice attempts.",
      assessment:
        "Initial resistance to exposure therapy is expected and was addressed through psychoeducation and collaborative hierarchy building. Client's willingness to engage after explanation suggests good therapeutic alliance and readiness for behavioral interventions. The completed hierarchy provides a structured roadmap for graduated exposure work. Breathing technique acquisition was efficient, suggesting good capacity for skill learning.",
      plan: "1. Begin exposure practice with lowest hierarchy item (greet coworker)\n2. Practice breathing technique daily (minimum 2x, 5 minutes each)\n3. Track SUDs ratings during exposure attempts\n4. Continue cognitive restructuring for anxiety-related thoughts\n5. Next appointment: March 5, 2026 at 10:30 AM",
    },
  },
};

function getMockDAPNote(noteId: string): DAPNote | null {
  return MOCK_NOTES[noteId] ?? null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a plan string into numbered list items. */
function parsePlanItems(plan: string): string[] {
  return plan
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DAPNoteDetailView({
  noteId,
  patientId,
  onBack,
  onEnterVisit,
}: DAPNoteDetailViewProps) {
  const note = getMockDAPNote(noteId);

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Text size="sm" muted>
          Note not found.
        </Text>
        <Button variant="ghost" onClick={onBack} className="mt-4 h-11">
          Go Back
        </Button>
      </div>
    );
  }

  const planItems = parsePlanItems(note.sections.plan);

  const dapSections: { label: string; content: React.ReactNode }[] = [
    {
      label: "Data",
      content: (
        <Text
          size="sm"
          className="text-foreground/80 whitespace-pre-wrap leading-relaxed"
        >
          {note.sections.data}
        </Text>
      ),
    },
    {
      label: "Assessment",
      content: (
        <Text
          size="sm"
          className="text-foreground/80 whitespace-pre-wrap leading-relaxed"
        >
          {note.sections.assessment}
        </Text>
      ),
    },
    {
      label: "Plan",
      content: (
        <ul className="space-y-3">
          {planItems.map((item, i) => (
            <motion.li
              key={i}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.08 * i,
                duration: 0.35,
                ease: smoothEase,
              }}
            >
              <span className="bg-primary/10 text-primary mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                {i + 1}
              </span>
              <Text size="sm" className="text-foreground/80 pt-0.5">
                {item}
              </Text>
            </motion.li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <motion.div
      className="flex flex-col"
      initial="hidden"
      animate="visible"
    >
      {/* ----------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        variants={headerVariants}
        className="border-border/30 mb-6 flex items-center justify-between border-b pb-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            aria-label="Go back to patient summary"
            className="bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground flex h-11 w-11 items-center justify-center rounded-xl transition-all"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(var(--primary), 0.1)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div>
            <Heading level={4} className="text-lg font-semibold sm:text-xl">
              Session Note
            </Heading>
            <Text size="sm" muted className="mt-0.5">
              {note.patientName}
            </Text>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Badge
            variant="secondary"
            className="bg-success/15 text-success rounded-lg px-3 py-1 text-xs font-semibold"
          >
            Signed &amp; Locked
          </Badge>
        </motion.div>
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* Body                                                              */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 space-y-5 pb-32 lg:pb-0"
      >
        {/* Session Metadata Card */}
        <motion.div variants={sectionVariants}>
          <Card className="border-border/40 from-muted/40 to-muted/20 overflow-hidden bg-gradient-to-br p-0 shadow-sm">
            <div className="divide-border/30 grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Patient
                </Text>
                <div className="flex items-center gap-1.5">
                  <User className="text-muted-foreground h-3.5 w-3.5" />
                  <Text size="sm" className="font-semibold">
                    {note.patientName}
                  </Text>
                </div>
              </div>
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Date of Service
                </Text>
                <div className="flex items-center gap-1.5">
                  <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                  <Text size="sm" className="font-semibold">
                    {note.sessionDate}
                  </Text>
                </div>
              </div>
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Provider
                </Text>
                <Text size="sm" className="font-semibold">
                  {note.provider}
                </Text>
              </div>
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Duration
                </Text>
                <div className="flex items-center gap-1.5">
                  <Clock className="text-muted-foreground h-3.5 w-3.5" />
                  <Text size="sm" className="font-semibold">
                    {note.sessionDuration} min
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* DAP Sections */}
        {dapSections.map((section) => (
          <motion.section key={section.label} variants={sectionVariants}>
            <Text
              size="xs"
              className="text-muted-foreground mb-3 font-bold tracking-wider uppercase"
            >
              {section.label}
            </Text>
            <Card className="border-border/40 bg-card/60 p-5 shadow-sm">
              {section.content}
            </Card>
          </motion.section>
        ))}

        {/* Signature Block */}
        <motion.div variants={sectionVariants}>
          <Card className="border-border/40 from-success/10 to-success/5 overflow-hidden bg-gradient-to-br p-0 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <Text size="sm" className="font-semibold">
                  Electronically signed by {note.provider}
                </Text>
                <Text size="xs" muted className="mt-0.5">
                  {note.sessionDate}
                </Text>
              </div>
              <Badge className="bg-success/15 text-success rounded-lg px-3 py-1 text-xs font-semibold">
                Verified
              </Badge>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ----------------------------------------------------------------- */}
      <div
        className={cn(
          "border-border/30 bg-background/95 fixed inset-x-0 bottom-0 flex items-center gap-3 border-t px-4 py-3 backdrop-blur-sm",
          "lg:static lg:mt-6 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none"
        )}
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="h-11 flex-1 lg:flex-none"
        >
          Back to Summary
        </Button>
        <Button
          onClick={onEnterVisit}
          className="h-11 flex-1 lg:flex-none"
        >
          Enter Visit &rarr;
        </Button>
      </div>
    </motion.div>
  );
}
