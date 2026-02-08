/**
 * Pre-Session Briefing React Query Hook
 * Fetches AI-generated briefing for upcoming patient sessions.
 *
 * @module lib/queries/use-pre-session-briefing
 */

import { useQuery } from "@tanstack/react-query";
import type { PreSessionBriefingData } from "@/components/substrate/PreSessionBriefing";

/**
 * Query key factory for pre-session briefings
 */
export const preSessionBriefingKeys = {
  all: ["pre-session-briefings"] as const,
  patient: (patientId: string) =>
    [...preSessionBriefingKeys.all, patientId] as const,
  patientWithDate: (patientId: string, date: string) =>
    [...preSessionBriefingKeys.patient(patientId), date] as const,
};

/**
 * API response type
 */
interface PreSessionBriefingResponse {
  data: PreSessionBriefingData | null;
  hasAppointmentToday: boolean;
}

/**
 * Fetch pre-session briefing for a patient
 */
async function fetchPreSessionBriefing(
  patientId: string,
  practiceId: string,
  date?: string
): Promise<PreSessionBriefingResponse> {
  const params = new URLSearchParams({
    patientId,
    practiceId,
  });

  if (date) {
    params.append("date", date);
  }

  const response = await fetch(`/api/substrate/briefing?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch pre-session briefing");
  }

  return response.json();
}

/**
 * Hook to fetch pre-session briefing for a patient
 * Only returns data if the patient has an appointment today
 */
export function usePreSessionBriefing(
  practiceId: string,
  patientId: string,
  options?: {
    date?: string;
    enabled?: boolean;
  }
) {
  const date = options?.date || new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: preSessionBriefingKeys.patientWithDate(patientId, date),
    queryFn: () => fetchPreSessionBriefing(patientId, practiceId, date),
    enabled: options?.enabled !== false && !!patientId && !!practiceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    select: (response) => ({
      briefing: response.data,
      hasAppointmentToday: response.hasAppointmentToday,
    }),
  });
}

/**
 * Check if patient has appointment today (lightweight check)
 */
export function useHasAppointmentToday(
  practiceId: string,
  patientId: string,
  options?: {
    enabled?: boolean;
  }
) {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["appointment-check", patientId, today] as const,
    queryFn: async () => {
      const response = await fetch(
        `/api/appointments/check?patientId=${patientId}&practiceId=${practiceId}&date=${today}`
      );

      if (!response.ok) {
        return { hasAppointment: false };
      }

      return response.json();
    },
    enabled: options?.enabled !== false && !!patientId && !!practiceId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false,
  });
}
