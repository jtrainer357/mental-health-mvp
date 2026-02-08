/**
 * Pre-Session Briefing Component
 * AI-generated briefing shown when a provider opens a patient record
 * with an upcoming appointment today.
 */

"use client";

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
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

function getTrend(current: number, previous: number | null) {
  if (previous === null) {
    return { icon: Minus, color: "text-muted-foreground", label: "No prior" };
  }
  const diff = current - previous;
  if (diff > 0) return { icon: TrendingUp, color: "text-destructive", label: \`+\${diff}\` };
  if (diff < 0) return { icon: TrendingDown, color: "text-green-600", label: \`\${diff}\` };
  return { icon: Minus, color: "text-muted-foreground", label: "No change" };
}

function getSeverityColor(severity: OutcomeScore["severity"]): string {
  const colors: Record<string, string> = {
    minimal: "bg-green-100 text-green-800",
    mild: "bg-yellow-100 text-yellow-800",
    moderate: "bg-orange-100 text-orange-800",
    moderately_severe: "bg-red-100 text-red-800",
    severe: "bg-red-200 text-red-900",
  };
  return colors[severity] || "bg-gray-100 text-gray-800";
}

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

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => {
      onExpand?.(!prev);
      return !prev;
    });
  }, [onExpand]);

  if (isLoading) {
    return (
      <div className={cn("bg-growth-teal text-white rounded-lg p-4", className)}>
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Preparing briefing...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("bg-destructive/10 border border-destructive/20 rounded-lg p-4", className)}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="text-foreground">{error.message}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-growth-teal text-white rounded-lg shadow-md overflow-hidden", className)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Pre-Session Briefing</h3>
                <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                  <Sparkles className="mr-1 h-3 w-3" />AI
                </Badge>
              </div>
              <p className="text-sm text-white/80">{data.patientName} • {data.appointmentTime}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleToggle} className="h-8 w-8 text-white hover:bg-white/20">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {onDismiss && (
              <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8 text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-white/70" />
            <span>{data.lastSessionDate ? new Date(data.lastSessionDate).toLocaleDateString() : "First session"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-white/70" />
            <span>{data.sessionCount} sessions</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {data.outcomeScores.length > 0 && (
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2">Outcome Measures</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {data.outcomeScores.map((score) => {
                      const trend = getTrend(score.currentScore, score.previousScore);
                      const TrendIcon = trend.icon;
                      return (
                        <div key={score.measureType} className="bg-white/10 rounded p-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs">{score.measureType}</span>
                            <Badge className={cn("text-xs", getSeverityColor(score.severity))}>
                              {score.severity.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="text-xl font-bold">{score.currentScore}/{score.maxScore}</div>
                          <div className="flex items-center gap-1 text-xs">
                            <TrendIcon className={cn("h-3 w-3", trend.color)} />
                            <span>{trend.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {data.keyInsights.length > 0 && (
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2">Key Insights</h4>
                  <ul className="space-y-1 text-sm">
                    {data.keyInsights.map((insight, i) => <li key={i}>• {insight}</li>)}
                  </ul>
                </div>
              )}

              {data.riskFactors.length > 0 && (
                <div className="bg-red-500/20 rounded-lg p-3 border border-red-400/30">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />Risk Factors
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {data.riskFactors.map((risk, i) => <li key={i}>• {risk}</li>)}
                  </ul>
                </div>
              )}

              {data.suggestedTopics.length > 0 && (
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2">Suggested Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.suggestedTopics.map((topic, i) => (
                      <Badge key={i} className="bg-white/20 text-white">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.activeMedications.length > 0 && (
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Pill className="h-4 w-4" />Medications
                  </h4>
                  {data.activeMedications.map((med, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{med.name}</span>
                      <span className="text-white/70">{med.dosage}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
