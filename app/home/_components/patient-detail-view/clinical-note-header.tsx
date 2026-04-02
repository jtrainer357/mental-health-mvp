"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Maximize2, Minimize2, Activity } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { smoothEase } from "@/design-system/lib/animation-constants";
import type { SelectedActivity } from "./types";

// ─── Animation ─────────────────────────────────────────────────────────────

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: smoothEase },
  },
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface ClinicalNoteHeaderProps {
  patientName: string;
  avatarSrc?: string;
  activity: SelectedActivity;
  sessionNumber: number;
  isFullView: boolean;
  onToggleFullView: () => void;
  onBack: () => void;
  provider?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ClinicalNoteHeader({
  patientName,
  avatarSrc,
  activity,
  sessionNumber,
  isFullView,
  onToggleFullView,
  onBack,
  provider,
}: ClinicalNoteHeaderProps) {
  return (
    <>
      {/* Header — sticky with blur */}
      <motion.div variants={headerVariants} className="mb-4 flex items-center justify-between py-3">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            aria-label="Go back"
            className="bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground flex h-10 w-10 items-center justify-center rounded-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="bg-avatar-fallback flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
            {patientName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <Heading level={4} className="text-lg font-semibold sm:text-xl">
              {patientName} &middot; Session #{sessionNumber}
            </Heading>
            <Text size="sm" muted className="mt-0.5 flex flex-wrap">
              {activity.date} &middot; {activity.appointmentType || "Individual Therapy"} &middot;{" "}
              {activity.duration || "50 min"} &middot; {activity.cptCode || "90837"} &middot;{" "}
              {activity.signedBy || provider || "Dr. Sarah Chen"}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activity.id === "new-session" && (
            <Button variant="default" size="sm" className="gap-2 font-bold">
              <Activity className="h-4 w-4" />
              Begin Listening
            </Button>
          )}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden lg:block"
          >
            {isFullView ? (
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleFullView}
                className="h-9 w-9 rounded-full transition-all"
                aria-label="Exit full view"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleFullView}
                className="gap-2 transition-all"
                aria-label="Enter full view"
              >
                <Maximize2 className="h-4 w-4" />
                <span>Full View</span>
              </Button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile full view button */}
      <div className="mb-4 lg:hidden">
        <Button
          variant="outline"
          onClick={onToggleFullView}
          className="border-border/50 hover:border-primary/30 hover:bg-primary/5 h-12 w-full gap-2 transition-all"
        >
          {isFullView ? (
            <>
              <Minimize2 className="h-4 w-4" />
              Exit Full View
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              View Full Note
            </>
          )}
        </Button>
      </div>
    </>
  );
}
