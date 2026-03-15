/**
 * Substrate Actions API
 * GET: Fetch priority actions for a practice
 * Uses synthetic data for demo mode (no Supabase required)
 */

import { NextRequest, NextResponse } from "next/server";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { createLogger } from "@/src/lib/logger";
import {
  SYNTHETIC_PRIORITY_ACTIONS,
  type SyntheticPriorityAction,
} from "@/src/lib/data/synthetic-priority-actions";
import { SYNTHETIC_PATIENTS } from "@/src/lib/data/synthetic-patients";

const log = createLogger("api/substrate/actions");

// Build patient lookup map
const patientMap = new Map(
  SYNTHETIC_PATIENTS.filter((p) => p.id.endsWith("-demo")).map((p) => [
    p.id,
    {
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      date_of_birth: p.date_of_birth,
      risk_level: p.risk_level,
      avatar_url: p.avatar_url,
    },
  ])
);

// Convert synthetic action to API format
function toApiAction(action: SyntheticPriorityAction) {
  const patient = patientMap.get(action.patient_id) || null;
  return {
    id: action.id,
    practice_id: action.practice_id,
    patient_id: action.patient_id,
    trigger_type: action.urgency === "urgent" ? "safety_risk" : "clinical_milestone",
    title: action.title,
    context: action.clinical_context,
    urgency: action.urgency,
    time_frame: action.timeframe,
    ai_confidence: action.confidence_score,
    ai_reasoning: action.clinical_context,
    suggested_actions: action.suggested_actions.map((label, i) => ({
      label,
      type: i === 0 ? "primary" : "secondary",
      completed: false,
    })),
    status: action.status === "pending" ? "active" : action.status,
    snoozed_until: null,
    dismissed_reason: null,
    completed_at: null,
    completed_by: null,
    created_at: action.created_at,
    updated_at: action.created_at,
    expires_at: null,
    patient,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const practiceId =
      searchParams.get("practice_id") || searchParams.get("practiceId") || DEMO_PRACTICE_ID;
    const patientId = searchParams.get("patient_id") || searchParams.get("patientId") || undefined;
    const status = searchParams.get("status") || "active";
    const urgencyParam = searchParams.get("urgency");
    const urgency = urgencyParam ? urgencyParam.split(",") : undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const includeCounts = searchParams.get("include_counts") === "true";

    log.debug("Fetching substrate actions (synthetic mode)", {
      practiceId,
      patientId,
      status,
      urgency,
      limit,
    });

    // Filter synthetic actions
    let actions = SYNTHETIC_PRIORITY_ACTIONS.filter((a) => a.practice_id === practiceId);

    if (patientId) {
      actions = actions.filter((a) => a.patient_id === patientId);
    }

    if (status === "active") {
      actions = actions.filter((a) => a.status === "pending");
    }

    if (urgency && urgency.length > 0) {
      actions = actions.filter((a) => urgency.includes(a.urgency));
    }

    // Sort by urgency
    const urgencyOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    actions.sort((a, b) => (urgencyOrder[a.urgency] ?? 4) - (urgencyOrder[b.urgency] ?? 4));

    if (limit) {
      actions = actions.slice(0, limit);
    }

    const apiActions = actions.map(toApiAction);

    // Optionally include counts
    let counts;
    if (includeCounts) {
      const allActive = SYNTHETIC_PRIORITY_ACTIONS.filter(
        (a) => a.practice_id === practiceId && a.status === "pending"
      );
      counts = {
        urgent: allActive.filter((a) => a.urgency === "urgent").length,
        high: allActive.filter((a) => a.urgency === "high").length,
        medium: allActive.filter((a) => a.urgency === "medium").length,
        low: allActive.filter((a) => a.urgency === "low").length,
        total: allActive.length,
      };
    }

    return NextResponse.json({
      success: true,
      actions: apiActions,
      total: apiActions.length,
      counts,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("Failed to fetch substrate actions", error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        actions: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
