/**
 * Session Query Hooks
 * React Query hooks for session note management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientKeys, queryKeys } from './keys';
import type {
  SessionNote,
  SessionAddendum,
  CreateSessionNoteInput,
  UpdateSessionNoteInput,
  SignSessionNoteInput,
  CreateAddendumInput,
  NoteStatus,
} from '@/lib/session/types';

/**
 * Session query keys
 */
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (practiceId: string) => [...sessionKeys.lists(), practiceId] as const,
  byPatient: (patientId: string) =>
    [...sessionKeys.all, 'patient', patientId] as const,
  byStatus: (practiceId: string, status: NoteStatus) =>
    [...sessionKeys.all, 'status', practiceId, status] as const,
  drafts: (practiceId: string) =>
    [...sessionKeys.all, 'drafts', practiceId] as const,
  unsigned: (practiceId: string) =>
    [...sessionKeys.all, 'unsigned', practiceId] as const,
  detail: (sessionId: string) =>
    [...sessionKeys.all, 'detail', sessionId] as const,
  addendums: (sessionId: string) =>
    [...sessionKeys.all, 'addendums', sessionId] as const,
  unsignedCount: (practiceId: string) =>
    [...sessionKeys.all, 'unsignedCount', practiceId] as const,
  patientDrafts: (patientId: string) =>
    [...sessionKeys.all, 'patientDrafts', patientId] as const,
};

// API base URL
const API_BASE = '/api/sessions';

/**
 * Fetch session notes for a patient
 */
async function fetchPatientSessions(patientId: string): Promise<SessionNote[]> {
  const response = await fetch(`${API_BASE}?patientId=${patientId}`);
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
}

/**
 * Fetch a single session note
 */
async function fetchSession(sessionId: string): Promise<SessionNote> {
  const response = await fetch(`${API_BASE}/${sessionId}`);
  if (!response.ok) throw new Error('Failed to fetch session');
  return response.json();
}

/**
 * Fetch draft sessions for a patient
 */
async function fetchPatientDrafts(patientId: string): Promise<SessionNote[]> {
  const response = await fetch(
    `${API_BASE}?patientId=${patientId}&status=draft`
  );
  if (!response.ok) throw new Error('Failed to fetch drafts');
  return response.json();
}

/**
 * Fetch unsigned session count for a practice
 */
async function fetchUnsignedCount(practiceId: string): Promise<number> {
  const response = await fetch(
    `${API_BASE}/unsigned-count?practiceId=${practiceId}`
  );
  if (!response.ok) throw new Error('Failed to fetch unsigned count');
  const data = await response.json();
  return data.count;
}

/**
 * Fetch addendums for a session
 */
async function fetchAddendums(sessionId: string): Promise<SessionAddendum[]> {
  const response = await fetch(`${API_BASE}/${sessionId}/addendums`);
  if (!response.ok) throw new Error('Failed to fetch addendums');
  return response.json();
}

/**
 * Create a new session note
 */
async function createSession(input: CreateSessionNoteInput): Promise<SessionNote> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error('Failed to create session');
  return response.json();
}

/**
 * Update a session note
 */
async function updateSession(
  sessionId: string,
  input: UpdateSessionNoteInput
): Promise<SessionNote> {
  const response = await fetch(`${API_BASE}/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error('Failed to update session');
  return response.json();
}

/**
 * Sign and lock a session note
 */
async function signSession(
  sessionId: string,
  input: SignSessionNoteInput
): Promise<SessionNote> {
  const response = await fetch(`${API_BASE}/${sessionId}/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error('Failed to sign session');
  return response.json();
}

/**
 * Add an addendum to a signed session
 */
async function createAddendum(
  input: CreateAddendumInput
): Promise<SessionAddendum> {
  const response = await fetch(
    `${API_BASE}/${input.sessionNoteId}/addendums`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  );
  if (!response.ok) throw new Error('Failed to create addendum');
  return response.json();
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to fetch session notes for a patient
 */
export function usePatientSessions(patientId: string) {
  return useQuery({
    queryKey: sessionKeys.byPatient(patientId),
    queryFn: () => fetchPatientSessions(patientId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch a single session note
 */
export function useSession(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () => fetchSession(sessionId),
    enabled: !!sessionId,
  });
}

/**
 * Hook to fetch draft sessions for a patient
 */
export function usePatientDrafts(patientId: string) {
  return useQuery({
    queryKey: sessionKeys.patientDrafts(patientId),
    queryFn: () => fetchPatientDrafts(patientId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch unsigned note count
 * Exposes count for EPSILON to wire into home page
 */
export function useUnsignedNoteCount(practiceId: string) {
  return useQuery({
    queryKey: sessionKeys.unsignedCount(practiceId),
    queryFn: () => fetchUnsignedCount(practiceId),
    enabled: !!practiceId,
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to fetch addendums for a session
 */
export function useSessionAddendums(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.addendums(sessionId),
    queryFn: () => fetchAddendums(sessionId),
    enabled: !!sessionId,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook to create a new session note
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      // Invalidate patient sessions
      queryClient.invalidateQueries({
        queryKey: sessionKeys.byPatient(data.patientId),
      });
      // Invalidate patient drafts
      queryClient.invalidateQueries({
        queryKey: sessionKeys.patientDrafts(data.patientId),
      });
    },
  });
}

/**
 * Hook to update a session note
 */
export function useUpdateSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSessionNoteInput) =>
      updateSession(sessionId, input),
    onSuccess: (data) => {
      // Update the session in cache
      queryClient.setQueryData(sessionKeys.detail(sessionId), data);
    },
  });
}

/**
 * Hook to auto-save a session note (optimistic, no invalidation)
 */
export function useAutoSaveSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSessionNoteInput) =>
      updateSession(sessionId, input),
    onSuccess: (data) => {
      // Silently update cache without invalidation
      queryClient.setQueryData(sessionKeys.detail(sessionId), data);
    },
    // Don't show errors for auto-save - handled by useAutoSave hook
    retry: 1,
  });
}

/**
 * Hook to sign and lock a session note
 */
export function useSignSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignSessionNoteInput) => signSession(sessionId, input),
    onSuccess: (data) => {
      // Update the session in cache
      queryClient.setQueryData(sessionKeys.detail(sessionId), data);
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: sessionKeys.byPatient(data.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.patientDrafts(data.patientId),
      });
      // Invalidate unsigned count
      queryClient.invalidateQueries({
        queryKey: sessionKeys.unsignedCount(data.practiceId),
      });
    },
  });
}

/**
 * Hook to create an addendum
 */
export function useCreateAddendum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddendum,
    onSuccess: (data) => {
      // Invalidate addendums list
      queryClient.invalidateQueries({
        queryKey: sessionKeys.addendums(data.sessionNoteId),
      });
    },
  });
}
