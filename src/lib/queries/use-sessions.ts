/**
 * Session Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SessionNote, SessionAddendum, CreateSessionNoteInput, UpdateSessionNoteInput, SignSessionNoteInput, CreateAddendumInput, NoteStatus } from '@/lib/session/types';

export const sessionKeys = {
  all: ['sessions'] as const,
  byPatient: (patientId: string) => [...sessionKeys.all, 'patient', patientId] as const,
  detail: (sessionId: string) => [...sessionKeys.all, 'detail', sessionId] as const,
  addendums: (sessionId: string) => [...sessionKeys.all, 'addendums', sessionId] as const,
  unsignedCount: (practiceId: string) => [...sessionKeys.all, 'unsignedCount', practiceId] as const,
  patientDrafts: (patientId: string) => [...sessionKeys.all, 'patientDrafts', patientId] as const,
};

const API_BASE = '/api/sessions';

async function fetchPatientSessions(patientId: string): Promise<SessionNote[]> {
  const response = await fetch(`${API_BASE}?patientId=${patientId}`);
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
}

async function fetchPatientDrafts(patientId: string): Promise<SessionNote[]> {
  const response = await fetch(`${API_BASE}?patientId=${patientId}&status=draft`);
  if (!response.ok) throw new Error('Failed to fetch drafts');
  return response.json();
}

async function fetchUnsignedCount(practiceId: string): Promise<number> {
  const response = await fetch(`${API_BASE}/unsigned-count?practiceId=${practiceId}`);
  if (!response.ok) throw new Error('Failed to fetch unsigned count');
  const data = await response.json();
  return data.count;
}

export function usePatientSessions(patientId: string) {
  return useQuery({ queryKey: sessionKeys.byPatient(patientId), queryFn: () => fetchPatientSessions(patientId), enabled: !!patientId });
}

export function usePatientDrafts(patientId: string) {
  return useQuery({ queryKey: sessionKeys.patientDrafts(patientId), queryFn: () => fetchPatientDrafts(patientId), enabled: !!patientId });
}

export function useUnsignedNoteCount(practiceId: string) {
  return useQuery({ queryKey: sessionKeys.unsignedCount(practiceId), queryFn: () => fetchUnsignedCount(practiceId), enabled: !!practiceId, refetchInterval: 60000 });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSessionNoteInput): Promise<SessionNote> => {
      const response = await fetch(API_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      if (!response.ok) throw new Error('Failed to create session');
      return response.json();
    },
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: sessionKeys.byPatient(data.patientId) }); },
  });
}

export function useUpdateSession(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateSessionNoteInput): Promise<SessionNote> => {
      const response = await fetch(`${API_BASE}/${sessionId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      if (!response.ok) throw new Error('Failed to update session');
      return response.json();
    },
    onSuccess: (data) => { queryClient.setQueryData(sessionKeys.detail(sessionId), data); },
  });
}

export function useSignSession(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SignSessionNoteInput): Promise<SessionNote> => {
      const response = await fetch(`${API_BASE}/${sessionId}/sign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      if (!response.ok) throw new Error('Failed to sign session');
      return response.json();
    },
    onSuccess: (data) => { queryClient.setQueryData(sessionKeys.detail(sessionId), data); queryClient.invalidateQueries({ queryKey: sessionKeys.byPatient(data.patientId) }); },
  });
}

export function useCreateAddendum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAddendumInput): Promise<SessionAddendum> => {
      const response = await fetch(`${API_BASE}/${input.sessionNoteId}/addendums`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      if (!response.ok) throw new Error('Failed to create addendum');
      return response.json();
    },
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: sessionKeys.addendums(data.sessionNoteId) }); },
  });
}
