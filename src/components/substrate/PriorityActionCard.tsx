"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Pill,
  Calendar,
  Brain,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  FileText,
  ClipboardCheck,
  ShieldCheck,
  ChevronDown,
  Check,
  X,
  Clock3,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { cn } from "@/design-system/lib/utils";
import { useToast } from "@/src/hooks/useToast";
import type { UrgencyLevel, SuggestedAction, SnoozeDuration } from "@/src/lib/triggers";

/**
 * Patient info attached to a priority action
 */
export interface ActionPatient {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
}

/**
 * Props for the PriorityActionCard component
 */
export interface PriorityActionCardProps {
  id: string;
  title: string;
  urgency: UrgencyLevel;
  confidence: number;
  timeFrame: string;
  context: string;
  suggestedActions: SuggestedAction[];
  patient?: ActionPatient;
  onComplete?: (id: string) => void;
  onDismiss?: (id: string, reason?: string) => void;
  onSnooze?: (id: string, duration: SnoozeDuration) => void;
  onActionClick?: (action: SuggestedAction) => void;
  className?: string;
  defaultExpanded?: boolean;
}

// Map suggested action types to icons
const actionTypeIcons: Record<string, LucideIcon> = {
  medication_action: Pill,
  appointment_create: Calendar,
  appointment_reschedule: Calendar,
  message_send: MessageCircle,
  note_sign: FileText,
  note_create: FileText,
  assessment_complete: ClipboardCheck,
  insurance_verify: ShieldCheck,
  treatment_plan_update: ClipboardCheck,
};

// Urgency badge styles
const urgencyBadgeStyles: Record<UrgencyLevel, string> = {
  urgent: "bg-red-500 text-white border-none",
  high: "bg-orange-500 text-white border-none",
  medium: "bg-teal text-white border-none",
  low: "bg-slate-500 text-white border-none",
};

// Urgency card border styles
const urgencyCardStyles: Record<UrgencyLevel, string> = {
  urgent: "border-l-red-500 bg-red-500/5 border-[0.5px] border-l-4 border-red-500/20",
  high: "border-l-orange-500 bg-orange-500/5 border-[0.5px] border-l-4 border-orange-500/20",
  medium: "border-l-teal bg-teal/5 border-[0.5px] border-l-4 border-teal/20",
  low: "border-l-slate-500 bg-slate-500/5 border-[0.5px] border-l-4 border-slate-500/20",
};

// Get icon for trigger type from title
function getIconFromTitle(title: string): LucideIcon {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("phq") || lowerTitle.includes("gad") || lowerTitle.includes("elevated")) {
    return TrendingUp;
  }
  if (lowerTitle.includes("medication") || lowerTitle.includes("refill")) {
    return Pill;
  }
  if (
    lowerTitle.includes("appointment") ||
    lowerTitle.includes("missed") ||
    lowerTitle.includes("not seen")
  ) {
    return Calendar;
  }
  if (lowerTitle.includes("note") || lowerTitle.includes("unsigned")) {
    return FileText;
  }
  if (lowerTitle.includes("insurance") || lowerTitle.includes("auth")) {
    return ShieldCheck;
  }
  if (lowerTitle.includes("intake")) {
    return ClipboardCheck;
  }
  return AlertTriangle;
}

export function PriorityActionCard({
  id,
  title,
  urgency,
  confidence,
  timeFrame,
  context,
  suggestedActions,
  patient,
  onComplete,
  onDismiss,
  onSnooze,
  onActionClick,
  className,
  defaultExpanded = false,
}: PriorityActionCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [showSnoozeOptions, setShowSnoozeOptions] = React.useState(false);
  const { showToast } = useToast();

  const Icon = getIconFromTitle(title);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete?.(id);
      showToast({ type: "success", message: "Action completed" });
    } catch {
      showToast({ type: "error", message: "Failed to complete action" });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDismiss = () => {
    onDismiss?.(id);
    showToast({ type: "info", message: "Action dismissed" });
  };

  const handleSnooze = (duration: SnoozeDuration) => {
    onSnooze?.(id, duration);
    setShowSnoozeOptions(false);
    const durationLabels: Record<SnoozeDuration, string> = {
      "24h": "24 hours",
      "3d": "3 days",
      "1w": "1 week",
    };
    showToast({ type: "info", message: `Snoozed for ${durationLabels[duration]}` });
  };

  const handleActionClick = (action: SuggestedAction) => {
    onActionClick?.(action);
    showToast({ type: "success", message: `${action.label} initiated` });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className={cn(
        "rounded-lg transition-shadow hover:shadow-sm",
        urgencyCardStyles[urgency],
        className
      )}
    >
      {/* Header - Always visible */}
      <div
        className="flex cursor-pointer items-start gap-3 p-3 sm:gap-4 sm:p-4"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        aria-expanded={isExpanded}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10",
            urgency === "urgent" && "bg-red-500/10 text-red-500",
            urgency === "high" && "bg-orange-500/10 text-orange-500",
            urgency === "medium" && "bg-teal/10 text-teal",
            urgency === "low" && "bg-slate-500/10 text-slate-500"
          )}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="text-foreground-strong text-sm font-semibold sm:text-base">{title}</h4>
              {patient && (
                <Link
                  href={`/patients/${patient.id}`}
                  className="text-primary mt-0.5 inline-flex items-center gap-1 text-xs hover:underline sm:text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {patient.first_name} {patient.last_name}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase sm:text-xs",
                  urgencyBadgeStyles[urgency]
                )}
              >
                {urgency}
              </Badge>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              </motion.div>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="mt-2 flex items-center gap-3">
            <span className="text-muted-foreground flex items-center gap-1 text-[10px] sm:text-xs">
              <Clock className="h-3 w-3" />
              {timeFrame}
            </span>
            <span className="text-teal flex items-center gap-1 text-[10px] sm:text-xs">
              <Sparkles className="h-3 w-3" />
              {confidence}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-border/50 border-t px-3 pt-3 pb-4 sm:px-4">
              {/* Clinical Context */}
              <div className="mb-4">
                <p className="text-muted-foreground text-sm leading-relaxed">{context}</p>
              </div>

              {/* Suggested Actions */}
              {suggestedActions.length > 0 && (
                <div className="mb-4">
                  <p className="text-foreground-muted mb-2 text-xs font-medium tracking-wide uppercase">
                    Suggested Actions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedActions.map((action, index) => {
                      const ActionIcon = actionTypeIcons[action.type] || AlertTriangle;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => handleActionClick(action)}
                        >
                          <ActionIcon className="h-3.5 w-3.5" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-border/50 flex flex-wrap items-center gap-2 border-t pt-3">
                <Button
                  size="sm"
                  className="bg-teal hover:bg-teal/90 h-9 gap-1.5"
                  onClick={handleComplete}
                  disabled={isCompleting}
                >
                  <Check className="h-4 w-4" />
                  {isCompleting ? "Completing..." : "Mark Complete"}
                </Button>

                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                  >
                    <Clock3 className="h-4 w-4" />
                    Snooze
                    <ChevronDown className="h-3 w-3" />
                  </Button>

                  <AnimatePresence>
                    {showSnoozeOptions && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-background absolute top-full left-0 z-10 mt-1 rounded-md border shadow-lg"
                      >
                        {[
                          { duration: "24h" as const, label: "24 hours" },
                          { duration: "3d" as const, label: "3 days" },
                          { duration: "1w" as const, label: "1 week" },
                        ].map(({ duration, label }) => (
                          <button
                            key={duration}
                            className="hover:bg-muted block w-full px-4 py-2 text-left text-sm"
                            onClick={() => handleSnooze(duration)}
                          >
                            {label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-9 gap-1.5"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
