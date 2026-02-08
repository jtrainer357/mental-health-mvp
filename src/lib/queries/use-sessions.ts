/**
 * Session Query Hooks
 * React Query hooks for clinical session management
 * @module queries/use-sessions
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  SessionNote,
  SessionAddendum,
  NoteType,
  NoteStatus,
} from "@/lib/session";

// Query keys
export const sessionKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  list: (patientId: string) => [...sessionKeys.lists(), patientId] as const,
  details: () => [...sessionKeys.all, "detail"] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
  drafts: (patientId: string) =>
    [...sessionKeys.all, "drafts", patientId] as const,
  unsignedCount: () => [...sessionKeys.all, "unsigned-count"] as const,
  addendums: (sessionId: string) =>
    [...sessionKeys.all, "addendums", sessionId] as const,
};

interface SessionFilters {
  status?: NoteStatus;
  noteType?: NoteType;
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch patient's session notes
 */
async function fetchPatientSessions(
  patientId: string,
  filters?: SessionFilters
): Promise<SessionNote[]> {
  const params = new URLSearchParams({ patientId });

  if (filters?.status) params.append("status", filters.status);
  if (filters?.noteType) params.append("noteType", filters.noteType);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const response = await fetch(`/api/sessions?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }

  return response.json();
}

/**
 * Fetch a single session note
 */
async function fetchSession(id: string): Promise<SessionNote> {
  const response = await fetch(`/api/sessions/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch session");
  }

  return response.json();
}

/**
 * Fetch patient's draft notes
 */
async function fetchPatientDrafts(patientId: string): Promise<SessionNote[]> {
  return fetchPatientSessions(patientId, { status: "draft" });
}

/**
 * Fetch unsigned note count for current user
 */
async function fetchUnsignedNoteCount(): Promise<{ count: number }> {
  const response = await fetch("/api/sessions/unsigned-count");

  if (!response.ok) {
    throw new Error("Failed to fetch unsigned count");
  }

  return response.json();
}

/**
 * Create a new session note
 */
async function createSession(
  data: Partial<SessionNote>
): Promise<SessionNote> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create session");
  }

  return response.json();
}

/**
 * Update a session note
 */
async function updateSession(
  id: string,
  data: Partial<SessionNote>
): Promise<SessionNote> {
  const response = await fetch(`/api/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update session");
  }

  return response.json();
}

/**
 * Sign a session note
 */
async function signSession(
  id: string,
  data: {
    signature: string;
    isLateEntry: boolean;
    lateEntryReason?: string;
  }
): Promise<SessionNote> {
  const response = await fetch(`/api/sessions/${id}/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to sign session");
  }

  return response.json();
}

/**
 * Fetch session addendums
 */
async function fetchAddendums(sessionId: string): Promise<SessionAddendum[]> {
  const response = await fetch(`/api/sessions/${sessionId}/addendums`);

  if (!response.ok) {
    throw new Error("Failed to fetch addendums");
  }

  return response.json();
}

/**
 * Create an addendum
 */
async function createAddendum(
  sessionId: string,
  data: { content: string; reason: string }
): Promise<SessionAddendum> {
  const response = await fetch(`/api/sessions/${sessionId}/addendums`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create addendum");
  }

  return response.json();
}

// ============ Hooks ============

/**
 * Hook to fetch patient's session notes
 */
export function usePatientSessions(
  patientId: string,
  filters?: SessionFilters
) {
  return useQuery({
    queryKey: [...sessionKeys.list(patientId), filters],
    queryFn: () => fetchPatientSessions(patientId, filters),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch a single session note
 */
export function useSession(id: string) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => fetchSession(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch patient's draft notes
 */
export function usePatientDrafts(patientId: string) {
  return useQuery({
    queryKey: sessionKeys.drafts(patientId),
    queryFn: () => fetchPatientDrafts(patientId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch unsigned note count (for EPSILON integration)
 */
export function useUnsignedNoteCount() {
  return useQuery({
    queryKey: sessionKeys.unsignedCount(),
    queryFn: fetchUnsignedNoteCount,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to create a session note
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.list(data.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.drafts(data.patientId),
      });
    },
  });
}

/**
 * Hook to update a session note
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SessionNote> }) =>
      updateSession(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(sessionKeys.detail(data.id), data);
      queryClient.invalidateQueries({
        queryKey: sessionKeys.list(data.patientId),
      });
    },
  });
}

/**
 * Hook to sign a session note
 */
export function useSignSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        signature: string;
        isLateEntry: boolean;
        lateEntryReason?: string;
      };
    }) => signSession(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(sessionKeys.detail(data.id), data);
      queryClient.invalidateQueries({
        queryKey: sessionKeys.list(data.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.drafts(data.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.unsignedCount(),
      });
    },
  });
}

/**
 * Hook to fetch session addendums
 */
export function useSessionAddendums(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.addendums(sessionId),
    queryFn: () => fetchAddendums(sessionId),
    enabled: !!sessionId,
  });
}

/**
 * Hook to create an addendum
 */
export function useCreateAddendum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: { content: string; reason: string };
    }) => createAddendum(sessionId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.addendums(data.sessionNoteId),
      });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(data.sessionNoteId),
      });
    },
  });
}
