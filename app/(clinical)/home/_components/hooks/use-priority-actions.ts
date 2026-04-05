"use client";

import * as React from "react";
import { getPriorityActions } from "@/src/lib/queries/priority-actions";
import { getTodayAppointments } from "@/src/lib/queries/appointments";
import { isDatabasePopulated } from "@/src/lib/queries/practice";
import type { PriorityActionWithPatient } from "@/src/lib/supabase/types";
import type { AppointmentWithPatient } from "@/src/lib/queries/appointments";
import type { SubstrateActionWithPatient } from "@/src/lib/substrate/service";
import { createLogger } from "@/src/lib/logger";
import {
  type UnifiedAction,
  type SuggestedActionItem,
  urgencyOrder,
} from "../utils/priority-action-utils";

const log = createLogger("usePriorityActions");

// ─── Converters ─────────────────────────────────────────────────────────────

/** Convert priority_actions row to unified action format */
function priorityActionToUnified(action: PriorityActionWithPatient): UnifiedAction {
  const suggestedActions: SuggestedActionItem[] = Array.isArray(action.suggested_actions)
    ? (action.suggested_actions as string[]).map((s) => ({
        label: s,
        type: "task",
        completed: false,
      }))
    : [];

  return {
    id: action.id,
    source: "priority",
    patient: action.patient,
    title: action.title,
    urgency: action.urgency as "urgent" | "high" | "medium" | "low",
    confidence: action.confidence_score || 85,
    timeframe: action.timeframe,
    context: action.clinical_context,
    suggested_actions: suggestedActions,
  };
}

/** Convert substrate_actions row to unified action format */
function substrateActionToUnified(action: SubstrateActionWithPatient): UnifiedAction | null {
  if (!action.patient) return null;

  const suggestedActions: SuggestedActionItem[] = Array.isArray(action.suggested_actions)
    ? action.suggested_actions.map((s) => ({
        label: (s as { label?: string }).label || String(s),
        type: (s as { type?: string }).type || "task",
        completed: (s as { completed?: boolean }).completed ?? false,
      }))
    : [];

  return {
    id: action.id,
    source: "substrate",
    patient: action.patient,
    title: action.title,
    urgency: action.urgency as "urgent" | "high" | "medium" | "low",
    confidence: action.ai_confidence,
    timeframe: action.time_frame,
    context: action.context,
    reasoning: action.ai_reasoning,
    trigger_type: action.trigger_type,
    suggested_actions: suggestedActions,
  };
}

// ─── API helpers ────────────────────────────────────────────────────────────

/** Fetch substrate actions from API */
async function fetchSubstrateActions(): Promise<SubstrateActionWithPatient[]> {
  try {
    const response = await fetch("/api/substrate/actions?status=active&limit=10");
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.actions || [];
  } catch {
    return [];
  }
}

/** Run substrate scan and return results */
async function runSubstrateScan(): Promise<{
  success: boolean;
  actions_created: number;
  triggers_detected: number;
  error?: string;
}> {
  try {
    const response = await fetch("/api/substrate/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triggered_by: "manual" }),
    });
    if (!response.ok) {
      throw new Error(`Scan failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    log.error("Substrate scan failed", error);
    return {
      success: false,
      actions_created: 0,
      triggers_detected: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface UsePriorityActionsReturn {
  actions: UnifiedAction[];
  allActions: UnifiedAction[];
  todayAppts: AppointmentWithPatient[];
  loading: boolean;
  scanning: boolean;
  scanResult: string | null;
  error: string | null;
  dbReady: boolean | null;
  loadData: () => Promise<void>;
  handleRunAnalysis: () => Promise<void>;
}

export function usePriorityActions(): UsePriorityActionsReturn {
  const [actions, setActions] = React.useState<UnifiedAction[]>([]);
  const [allActions, setAllActions] = React.useState<UnifiedAction[]>([]);
  const [todayAppts, setTodayAppts] = React.useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [scanning, setScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [dbReady, setDbReady] = React.useState<boolean | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if database is populated
      const populated = await isDatabasePopulated();
      setDbReady(populated);

      if (!populated) {
        setLoading(false);
        return;
      }

      // Fetch both substrate actions and priority actions in parallel
      const [substrateActions, priorityActions, apptsData] = await Promise.all([
        fetchSubstrateActions(),
        getPriorityActions(),
        getTodayAppointments(),
      ]);

      // Convert to unified format and merge
      const substrateUnified = substrateActions
        .map(substrateActionToUnified)
        .filter((a): a is UnifiedAction => a !== null);

      const priorityUnified = priorityActions.map(priorityActionToUnified);

      // Merge: substrate actions first (they're real intelligence), then priority as fallback
      // Deduplicate by patient_id + similar title
      const seenPatientTitles = new Set<string>();
      const merged: UnifiedAction[] = [];

      // Add substrate actions first
      for (const action of substrateUnified) {
        const key = `${action.patient.id}-${action.title.toLowerCase().substring(0, 30)}`;
        if (!seenPatientTitles.has(key)) {
          seenPatientTitles.add(key);
          merged.push(action);
        }
      }

      // Add priority actions that don't overlap
      for (const action of priorityUnified) {
        const key = `${action.patient.id}-${action.title.toLowerCase().substring(0, 30)}`;
        if (!seenPatientTitles.has(key)) {
          seenPatientTitles.add(key);
          merged.push(action);
        }
      }

      // Sort by urgency priority
      merged.sort((a, b) => {
        const aOrder = urgencyOrder[a.urgency] ?? 4;
        const bOrder = urgencyOrder[b.urgency] ?? 4;
        return aOrder - bOrder;
      });

      setAllActions(merged);
      setActions(merged.slice(2, 4)); // Show middle 2 (removed top 2 and last)
      setTodayAppts(apptsData);
    } catch (err) {
      log.error("Failed to load priority actions", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle substrate scan refresh
  const handleRunAnalysis = React.useCallback(async () => {
    setScanning(true);
    setScanResult(null);

    const result = await runSubstrateScan();

    if (result.success) {
      setScanResult(
        `Analysis complete: ${result.triggers_detected} triggers detected, ${result.actions_created} new actions`
      );
      // Reload data after scan
      await loadData();
    } else {
      setScanResult(`Analysis failed: ${result.error || "Unknown error"}`);
    }

    setScanning(false);

    // Clear message after 5 seconds
    setTimeout(() => setScanResult(null), 5000);
  }, [loadData]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    actions,
    allActions,
    todayAppts,
    loading,
    scanning,
    scanResult,
    error,
    dbReady,
    loadData,
    handleRunAnalysis,
  };
}
