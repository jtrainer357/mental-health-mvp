/**
 * Pre-Session Briefing Component
 * AI-generated briefing shown when a provider opens a patient record
 * with an upcoming appointment today.
 *
 * @module components/substrate/PreSessionBriefing
 */

"use client";

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Pill,
  FileText,
  Activity,
  Calendar,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface OutcomeScore {
  measureType: "PHQ-9" | "GAD-7" | "PCL-5";
  currentScore: number;
  previousScore: number | null;
  maxScore: number;
  severity: "minimal" | "mild" | "moderate" | "moderately_severe" | "severe";
  dateAdministered: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  refillDue?: string;
}

export interface SessionNote {
  date: string;
  type: string;
  summary: string;
}

export interface PreSessionBriefingData {
  patientId: string;
  patientName: string;
  appointmentTime: string;
  appointmentType: string;
  lastSessionDate: string | null;
  sessionCount: number;
  treatmentDuration: string;
  primaryDiagnosis: string[];
  outcomeScores: OutcomeScore[];
  activeMedications: Medication[];
  recentNotes: SessionNote[];
  keyInsights: string[];
  suggestedTopics: string[];
  riskFactors: string[];
}

export interface PreSessionBriefingProps {
  data: PreSessionBriefingData | null;
  isLoading?: boolean;
  error?: Error | null;
  onDismiss?: () => void;
  onExpand?: (expanded: boolean) => void;
  className?: string;
  defaultExpanded?: boolean;
}

/**
 * Get trend icon and color based on score change
 */
function getTrend(current: number, previous: number | null): {
  icon: typeof TrendingUp;
  color: string;
  label: string;
} {
  if (previous === null) {
    return { icon: Minus, color: "text-muted-foreground", label: "No prior score" };
  }

  const diff = current - previous;
  if (diff > 0) {
    // Higher score = worse (for PHQ-9, GAD-7, PCL-5)
    return { icon: TrendingUp, color: "text-destructive", label: `+${diff} from last` };
  } else if (diff < 0) {
    // Lower score = better
    return { icon: TrendingDown, color: "text-green-600", label: `${diff} from last` };
  }
  return { icon: Minus, color: "text-muted-foreground", label: "No change" };
}

/**
 * Get severity badge color
 */
function getSeverityColor(severity: OutcomeScore["severity"]): string {
  switch (severity) {
    case "minimal":
      return "bg-green-100 text-green-800 border-green-200";
    case "mild":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "moderate":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "moderately_severe":
      return "bg-red-100 text-red-800 border-red-200";
    case "severe":
      return "bg-red-200 text-red-900 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/**
 * Format severity label
 */
function formatSeverity(severity: OutcomeScore["severity"]): string {
  return severity.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Pre-Session Briefing Component
 * Displays an AI-generated overview before a patient session.
 */
export const PreSessionBriefing = memo(function PreSessionBriefing({
  data,
  isLoading = false,
  error = null,
  onDismiss,
  onExpand,
  className,
  defaultExpanded = true,
}: PreSessionBriefingProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => {
      const newValue = !prev;
      onExpand?.(newValue);
      return newValue;
    });
  }, [onExpand]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-growth-teal text-white rounded-lg p-4 shadow-md",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <h3 className="font-semibold">Preparing Pre-Session Briefing</h3>
            <p className="text-sm text-white/80">
              Analyzing patient data and recent activity...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "bg-destructive/10 border border-destructive/20 rounded-lg p-4",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              Unable to Load Briefing
            </h3>
            <p className="text-sm text-muted-foreground">
              {error.message || "Failed to generate pre-session briefing."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No data or no appointment today
  if (!data) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-growth-teal text-white rounded-lg shadow-md overflow-hidden",
        className
      )}
    >
      {/* Header - Always visible */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Brain className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">Pre-Session Briefing</h3>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30 text-xs"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Generated
                </Badge>
              </div>
              <p className="text-sm text-white/80 mt-0.5">
                {data.patientName} • {data.appointmentType} at {data.appointmentTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleExpand}
              className="h-8 w-8 text-white hover:bg-white/20"
              aria-label={isExpanded ? "Collapse briefing" : "Expand briefing"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="h-8 w-8 text-white hover:bg-white/20"
                aria-label="Dismiss briefing"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats - Always visible */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-white/70" />
            <span>
              {data.lastSessionDate
                ? `Last seen: ${new Date(data.lastSessionDate).toLocaleDateString()}`
                : "First session"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-white/70" />
            <span>{data.sessionCount} sessions ({data.treatmentDuration})</span>
          </div>
          {data.primaryDiagnosis.length > 0 && (
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-white/70" />
              <span>{data.primaryDiagnosis.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Outcome Scores */}
              {data.outcomeScores.length > 0 && (
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Outcome Measures
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {data.outcomeScores.map((score) => {
                      const trend = getTrend(score.currentScore, score.previousScore);
                      const TrendIcon = trend.icon;
                      return (
                        <div
                          key={score.measureType}
                          className="bg-white/10 rounded-md p-2"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{score.measureType}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs px-1.5 py-0",
                                getSeverityColor(score.severity)
                              )}
                            >
                              {formatSeverity(score.severity)}
                            </Badge>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold">{score.currentScore}</span>
                            <span className="text-xs text-white/60">/{score.maxScore}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs">
                            <TrendIcon className={cn("h-3 w-3", trend.color)} />
                            <span className={trend.color}>{trend.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Insights */}
              {data.keyInsights.length > 0 && (
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Key Insights
                  </h4>
                  <ul className="space-y-1">
                    {data.keyInsights.map((insight, idx) => (
                      <li key={idx} className="text-sm text-white/90 flex items-start gap-2">
                        <span className="text-white/50">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {data.riskFactors.length > 0 && (
                <div className="bg-red-500/20 rounded-lg p-3 border border-red-400/30">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Factors to Address
                  </h4>
                  <ul className="space-y-1">
                    {data.riskFactors.map((risk, idx) => (
                      <li key={idx} className="text-sm text-white/90 flex items-start gap-2">
                        <span className="text-white/50">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Topics */}
              {data.suggestedTopics.length > 0 && (
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Suggested Discussion Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.suggestedTopics.map((topic, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Medications */}
              {data.activeMedications.length > 0 && (
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Active Medications
                  </h4>
                  <div className="space-y-2">
                    {data.activeMedications.map((med, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{med.name}</span>
                        <span className="text-white/70">
                          {med.dosage} • {med.frequency}
                          {med.refillDue && (
                            <span className="ml-2 text-yellow-300">
                              Refill due: {new Date(med.refillDue).toLocaleDateString()}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
