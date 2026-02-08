/**
 * Session Management Types
 */

export type NoteType = 'progress_note' | 'initial_evaluation' | 'crisis_note';
export type NoteStatus = 'draft' | 'signed' | 'amended';
export type DiagnosisStatus = 'active' | 'resolved' | 'rule_out';

export interface CPTCode {
  code: string;
  description: string;
  minMinutes: number;
  maxMinutes: number;
  fee: number;
}

export const CPT_CODES: CPTCode[] = [
  { code: '90832', description: 'Individual psychotherapy, 16-37 minutes', minMinutes: 16, maxMinutes: 37, fee: 85 },
  { code: '90834', description: 'Individual psychotherapy, 38-52 minutes', minMinutes: 38, maxMinutes: 52, fee: 130 },
  { code: '90837', description: 'Individual psychotherapy, 53+ minutes', minMinutes: 53, maxMinutes: 999, fee: 175 },
  { code: '90836', description: 'Individual psychotherapy with E/M, 53+ minutes', minMinutes: 53, maxMinutes: 999, fee: 195 },
  { code: '90839', description: 'Crisis psychotherapy, first 60 minutes', minMinutes: 30, maxMinutes: 74, fee: 200 },
  { code: '90840', description: 'Crisis psychotherapy, each additional 30 minutes', minMinutes: 75, maxMinutes: 999, fee: 100 },
  { code: '90791', description: 'Psychiatric diagnostic evaluation', minMinutes: 45, maxMinutes: 999, fee: 250 },
  { code: '90792', description: 'Psychiatric diagnostic evaluation with medical services', minMinutes: 45, maxMinutes: 999, fee: 300 },
];

export function getSuggestedCPTCode(minutes: number, noteType: NoteType = 'progress_note'): CPTCode | null {
  if (noteType === 'initial_evaluation') return CPT_CODES.find(c => c.code === '90791') ?? null;
  if (noteType === 'crisis_note') return minutes >= 75 ? CPT_CODES.find(c => c.code === '90840') ?? null : CPT_CODES.find(c => c.code === '90839') ?? null;
  if (minutes < 16) return null;
  if (minutes <= 37) return CPT_CODES.find(c => c.code === '90832') ?? null;
  if (minutes <= 52) return CPT_CODES.find(c => c.code === '90834') ?? null;
  return CPT_CODES.find(c => c.code === '90837') ?? null;
}

export interface SessionNote {
  id: string;
  practiceId: string;
  patientId: string;
  appointmentId?: string;
  sessionDate: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  totalMinutes?: number;
  noteType: NoteType;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  biopsychosocialHistory?: string;
  safetyAssessment?: string;
  safetyPlan?: string;
  cptCode?: string;
  cptCodeSuggested?: string;
  cptOverrideReason?: string;
  status: NoteStatus;
  signedBy?: string;
  signedAt?: string;
  signerName?: string;
  signerCredentials?: string;
  isLateEntry: boolean;
  lastSavedAt: string;
  aiGenerated: boolean;
  aiTranscript?: string;
  aiModel?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SessionAddendum {
  id: string;
  sessionNoteId: string;
  authorId?: string;
  authorName: string;
  authorCredentials?: string;
  content: string;
  createdAt: string;
}

export interface CreateSessionNoteInput {
  practiceId: string;
  patientId: string;
  appointmentId?: string;
  noteType: NoteType;
  sessionDate?: string;
}

export interface UpdateSessionNoteInput {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  biopsychosocialHistory?: string;
  safetyAssessment?: string;
  safetyPlan?: string;
  cptCode?: string;
  cptOverrideReason?: string;
  totalMinutes?: number;
  sessionStartTime?: string;
  sessionEndTime?: string;
}

export interface SignSessionNoteInput {
  signerName: string;
  signerCredentials: string;
}

export interface CreateAddendumInput {
  sessionNoteId: string;
  authorName: string;
  authorCredentials?: string;
  content: string;
}

export function isLateEntry(sessionDate: string, signedAt?: string): boolean {
  const session = new Date(sessionDate);
  const signed = signedAt ? new Date(signedAt) : new Date();
  return (signed.getTime() - session.getTime()) / (1000 * 60 * 60) > 24;
}

export function getDaysSinceSession(sessionDate: string): number {
  const session = new Date(sessionDate);
  const now = new Date();
  return Math.floor((now.getTime() - session.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDraftWarningLevel(daysSinceSession: number): 'none' | 'warning' | 'urgent' | 'critical' {
  if (daysSinceSession < 1) return 'none';
  if (daysSinceSession < 2) return 'warning';
  if (daysSinceSession < 3) return 'urgent';
  return 'critical';
}
