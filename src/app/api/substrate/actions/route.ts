/**
 * Substrate Actions API
 * GET: Fetch priority actions for a practice
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/client";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("api/substrate/actions");

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const practiceId = searchParams.get("practiceId") || DEMO_PRACTICE_ID;
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status") || "pending";

    const supabase = createClient();

    let query = supabase
      .from("prioritized_actions")
      .select(
        `
        *,
        patient:patients(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("practice_id", practiceId);

    // Filter by patient if specified
    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    // Filter by status
    if (status === "pending") {
      query = query.or("status.eq.pending,status.is.null");
    } else if (status !== "all") {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      log.error("Failed to fetch priority actions", error, { practiceId, patientId });
      return NextResponse.json({ error: "Failed to fetch actions" }, { status: 500 });
    }

    // Sort by urgency
    const urgencyOrder: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    const sorted = (data || []).sort((a, b) => {
      const aUrgency = (a.urgency || "medium").toLowerCase();
      const bUrgency = (b.urgency || "medium").toLowerCase();
      const urgencyDiff = (urgencyOrder[aUrgency] ?? 3) - (urgencyOrder[bUrgency] ?? 3);
      if (urgencyDiff !== 0) return urgencyDiff;
      return (b.ai_confidence || 85) - (a.ai_confidence || 85);
    });

    return NextResponse.json({
      actions: sorted,
      count: sorted.length,
      practiceId,
    });
  } catch (error) {
    log.error("Unexpected error in actions API", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
