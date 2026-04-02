"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { smoothEase } from "@/design-system/lib/animation-constants";

// ─── Note Type Pills ────────────────────────────────────────────────────────

const NOTE_TYPE_PILLS = [
  { id: "dap", label: "DAP" },
  { id: "soap", label: "SOAP" },
  { id: "gen-psych", label: "Gen Psych" },
  { id: "custom", label: "Custom" },
] as const;

// ─── Section config by note type ────────────────────────────────────────────

const SECTION_CONFIG: Record<string, { key: string; label: string; placeholder: string }[]> = {
  dap: [
    { key: "data", label: "DATA", placeholder: "Session recording will populate this section. Tap Start Listening to start." },
    { key: "assessment", label: "ASSESSMENT", placeholder: "Assessment will be generated from session recording." },
    { key: "plan", label: "PLAN", placeholder: "Plan items will be generated from session recording." },
  ],
  soap: [
    { key: "subjective", label: "SUBJECTIVE", placeholder: "Patient's reported symptoms, concerns, and history." },
    { key: "objective", label: "OBJECTIVE", placeholder: "Clinical observations, measurements, and test results." },
    { key: "assessment", label: "ASSESSMENT", placeholder: "Clinical assessment and diagnosis." },
    { key: "plan", label: "PLAN", placeholder: "Treatment plan and next steps." },
  ],
  "gen-psych": [
    { key: "presentation", label: "PRESENTATION", placeholder: "Mental status and presenting concerns." },
    { key: "intervention", label: "INTERVENTION", placeholder: "Therapeutic interventions used in session." },
    { key: "response", label: "RESPONSE", placeholder: "Patient's response to interventions." },
    { key: "plan", label: "PLAN", placeholder: "Treatment plan and follow-up." },
  ],
  custom: [
    { key: "notes", label: "SESSION NOTES", placeholder: "Begin typing your session notes..." },
  ],
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface EmptyNoteEditorProps {
  noteType: string;
  onNoteTypeChange: (type: string) => void;
  patientName: string;
  isFullView: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function EmptyNoteEditor({
  noteType,
  onNoteTypeChange,
  isFullView,
}: EmptyNoteEditorProps) {
  const sections = SECTION_CONFIG[noteType] ?? SECTION_CONFIG.dap!;
  const [sectionContent, setSectionContent] = React.useState<Record<string, string>>({});

  // Reset content when note type changes
  React.useEffect(() => {
    setSectionContent({});
  }, [noteType]);

  const updateSection = (key: string, value: string) => {
    setSectionContent((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <CardWrapper
      className={cn(
        "flex flex-1 flex-col",
        !isFullView && "border-0 bg-transparent px-0 shadow-none backdrop-blur-none"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: smoothEase }}
        className="flex flex-1 flex-col"
      >
        {/* Single card containing all sections */}
        <div className="border-border/50 bg-card flex flex-1 flex-col rounded-xl border shadow-sm">
          {/* Top bar: first section label + note type pills */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <Text size="xs" className="text-foreground font-bold tracking-wider uppercase">
              {sections[0]!.label}
            </Text>
            <div className="flex gap-1.5">
              {NOTE_TYPE_PILLS.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => onNoteTypeChange(type.id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                    noteType === type.id
                      ? "bg-foreground text-card shadow-sm"
                      : "border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sections inside one continuous editor */}
          <div className="flex flex-1 flex-col px-6 py-4">
            {sections.map((section, idx) => (
              <div key={section.key} className="flex flex-col">
                {/* Section header — skip first one since it's in the top bar */}
                {idx > 0 && (
                  <Text size="xs" className="text-foreground mt-6 mb-2 font-bold tracking-wider uppercase">
                    {section.label}
                  </Text>
                )}

                {/* Editable area */}
                <textarea
                  value={sectionContent[section.key] ?? ""}
                  onChange={(e) => updateSection(section.key, e.target.value)}
                  placeholder={section.placeholder}
                  className={cn(
                    "min-h-[80px] w-full resize-none bg-transparent text-sm leading-relaxed outline-none",
                    "text-foreground/80 placeholder:text-muted-foreground/40",
                    idx === 0 && "mt-3",
                  )}
                  rows={3}
                />

                {/* Subtle divider between sections */}
                {idx < sections.length - 1 && (
                  <div className="border-border/30 border-b" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </CardWrapper>
  );
}
