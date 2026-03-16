"use client";

import * as React from "react";
import { motion, AnimatePresence, type Easing } from "framer-motion";
import { usePatientViewState } from "@/src/hooks/usePatientViewState";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { cn } from "@/design-system/lib/utils";
import { FullDemographics } from "./header-variants/FullDemographics";
import { MinimalDemographics } from "./header-variants/MinimalDemographics";
import { UltraMinimalHeader } from "./header-variants/UltraMinimalHeader";
import type { PatientDetail } from "./types";

interface AdaptivePatientHeaderProps {
  patient: PatientDetail;
  className?: string;
  /** Callback to navigate back to patient roster (mobile only) */
  onBackToRoster?: () => void;
}

/**
 * Breakpoint for mobile detection
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Hook for detecting mobile viewport
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Check initial viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Set initial value
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
}

/**
 * AdaptivePatientHeader
 *
 * A responsive patient header that adapts to three height modes based on view state:
 * - default (120px): Full demographics with metrics and action buttons
 * - summary/note (90px): Compact essential info with dropdown actions
 * - fullView (50px): Ultra-minimal with only name and navigation
 *
 * Features:
 * - Smooth Framer Motion height transitions
 * - AnimatePresence for content swap animations
 * - Mobile-first responsive design (uses minimal on <768px)
 * - Sticky positioning for scroll
 * - Proper z-index layering
 */
export function AdaptivePatientHeader({
  patient,
  className,
  onBackToRoster,
}: AdaptivePatientHeaderProps) {
  const { viewState, layout, transition, goBack, transitionTo, selectedNoteId } =
    usePatientViewState();
  const isMobile = useIsMobile();

  // Determine effective view state (mobile always uses minimal unless in fullView)
  const effectiveViewState = React.useMemo(() => {
    if (isMobile && viewState === "default") {
      return "summary";
    }
    return viewState;
  }, [isMobile, viewState]);

  // Calculate effective header height
  const effectiveHeight = React.useMemo(() => {
    if (isMobile && viewState === "default") {
      return 110; // Use minimal header height on mobile
    }
    return layout.headerHeight;
  }, [isMobile, viewState, layout.headerHeight]);

  // Get note context for fullView mode
  const noteContext = React.useMemo(() => {
    if (viewState !== "fullView" || !selectedNoteId) {
      return { noteDate: null, noteTitle: null };
    }

    // Find the note in recent activity
    const activity = patient.recentActivity.find((a) => a.id === selectedNoteId);
    return {
      noteDate: activity?.date ?? null,
      noteTitle: activity?.title ?? null,
    };
  }, [viewState, selectedNoteId, patient.recentActivity]);

  // Handlers
  const handleExpand = React.useCallback(() => {
    transitionTo("default");
  }, [transitionTo]);

  const handleBack = React.useCallback(() => {
    goBack();
  }, [goBack]);

  const handleClose = React.useCallback(() => {
    transitionTo("default");
  }, [transitionTo]);

  // Determine which header variant to show
  const isFullHeader = effectiveViewState === "default";
  const isMinimalHeader = effectiveViewState === "summary" || effectiveViewState === "note";
  const isUltraMinimalHeader = effectiveViewState === "fullView";

  return (
    <motion.header
      initial={false}
      animate={{ height: effectiveHeight }}
      transition={{
        duration: transition.duration,
        ease: transition.ease as Easing,
      }}
      className={cn("sticky top-0 z-20 overflow-hidden", className)}
      style={{ willChange: "height" }}
    >
      <CardWrapper
        className={cn(
          "h-full p-0",
          // Adjust border radius based on state
          isUltraMinimalHeader && "rounded-none"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isFullHeader && (
            <FullDemographics key="full" patient={patient} onBackToRoster={onBackToRoster} />
          )}

          {isMinimalHeader && (
            <MinimalDemographics
              key="minimal"
              patient={patient}
              onExpand={!isMobile ? handleExpand : undefined}
              onBackToRoster={onBackToRoster}
            />
          )}

          {isUltraMinimalHeader && (
            <UltraMinimalHeader
              key="ultra"
              patient={patient}
              noteDate={noteContext.noteDate}
              noteTitle={noteContext.noteTitle}
              onBack={handleBack}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>
      </CardWrapper>
    </motion.header>
  );
}

export type { AdaptivePatientHeaderProps };
