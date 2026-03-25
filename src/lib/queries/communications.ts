/**
 * Communications Queries
 * Fetches patient messages from Supabase with demo data fallback
 */

import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import type { Communication as CommunicationRow, Patient } from "@/src/lib/supabase/types";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { getDemoCommunicationThreads } from "@/src/lib/data/adapter";

const log = createLogger("queries/communications");

// Re-export the Communication type for backwards compatibility
export type Communication = CommunicationRow;

export type CommunicationWithPatient = Communication & {
  patient: Pick<Patient, "id" | "first_name" | "last_name" | "avatar_url">;
};

/**
 * Get all communications for a practice
 */
export async function getCommunications(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<CommunicationWithPatient[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("communications")
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
    .eq("practice_id", practiceId)
    .order("sent_at", { ascending: false });

  if (error) {
    log.error("Failed to fetch communications", error, { action: "getCommunications", practiceId });
    throw error;
  }

  return (data || []) as unknown as CommunicationWithPatient[];
}

/**
 * Get communications for a specific patient
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientCommunications(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Communication[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("communications")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("sent_at", { ascending: false });

  if (error) {
    log.error("Failed to fetch patient communications", error, {
      action: "getPatientCommunications",
      patientId,
    });
    throw error;
  }

  return (data || []) as Communication[];
}

/**
 * Get unread communications count
 */
export async function getUnreadCount(practiceId: string = DEMO_PRACTICE_ID): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("communications")
    .select("*", { count: "exact", head: true })
    .eq("practice_id", practiceId)
    .eq("direction", "inbound")
    .eq("is_read", false);

  if (error) {
    log.error("Failed to fetch unread count", error, { action: "getUnreadCount", practiceId });
    return 0;
  }

  return count || 0;
}

/**
 * Mark a communication as read
 * @param communicationId - The communication's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function markAsRead(
  communicationId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("communications")
    .update({ is_read: true })
    .eq("id", communicationId)
    .eq("practice_id", practiceId);

  if (error) {
    log.error("Failed to mark communication as read", error, {
      action: "markAsRead",
      communicationId,
    });
    throw error;
  }
}

/**
 * Get communications grouped by patient (for thread view)
 * Falls back to demo data if Supabase query fails
 */
export async function getCommunicationThreads(practiceId: string = DEMO_PRACTICE_ID): Promise<
  Array<{
    patient: Pick<Patient, "id" | "first_name" | "last_name" | "avatar_url">;
    messages: Communication[];
    unreadCount: number;
    lastMessage: Communication | null;
  }>
> {
  const supabase = createClient();

  // Get demo threads (always available)
  const demoThreads = getDemoCommunicationThreads();

  try {
    // Get all communications with patient info
    const { data, error } = await supabase
      .from("communications")
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
      .eq("practice_id", practiceId)
      .order("sent_at", { ascending: false });

    if (error) {
      log.warn("Failed to fetch communications from DB, using demo data only", {
        action: "getCommunicationThreads",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return demoThreads as any;
    }

    // If no DB data, return demo threads
    if (!data || data.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return demoThreads as any;
    }

    // Group by patient
    const patientMap = new Map<
      string,
      {
        patient: Pick<Patient, "id" | "first_name" | "last_name" | "avatar_url">;
        messages: Communication[];
        unreadCount: number;
      }
    >();

    const communications = (data || []) as unknown as CommunicationWithPatient[];
    communications.forEach((comm) => {
      const patientId = comm.patient_id;
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          patient: comm.patient,
          messages: [],
          unreadCount: 0,
        });
      }

      const thread = patientMap.get(patientId)!;
      thread.messages.push(comm);
      if (!comm.is_read && comm.direction === "inbound") {
        thread.unreadCount++;
      }
    });

    // Convert to array and add lastMessage
    const dbThreads = Array.from(patientMap.values())
      .map((thread) => ({
        ...thread,
        lastMessage: thread.messages[0] || null,
      }))
      .sort((a, b) => {
        const aTime = a.lastMessage?.sent_at || "";
        const bTime = b.lastMessage?.sent_at || "";
        return bTime.localeCompare(aTime);
      });

    // Merge with demo threads (demo threads for patients not in DB)
    const dbPatientIds = new Set(dbThreads.map((t) => t.patient.id));
    const uniqueDemoThreads = demoThreads.filter((t) => !dbPatientIds.has(t.patient.id));

    return [...dbThreads, ...uniqueDemoThreads].sort((a, b) => {
      const aTime = a.lastMessage?.sent_at || "";
      const bTime = b.lastMessage?.sent_at || "";
      return bTime.localeCompare(aTime);
    });
  } catch {
    // Fallback to demo threads on any error
    return demoThreads;
  }
}
