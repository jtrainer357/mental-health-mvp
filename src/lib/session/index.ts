/**
 * Session Management Module
 * Clinical session documentation and workflow
 */

// Types
export type {
  NoteType,
  NoteStatus,
  DiagnosisStatus,
  CPTCode,
  SessionNote,
  SessionAddendum,
  CreateSessionNoteInput,
  UpdateSessionNoteInput,
  SignSessionNoteInput,
  CreateAddendumInput,
} from './types';

export {
  CPT_CODES,
  getSuggestedCPTCode,
  isLateEntry,
  getDaysSinceSession,
  getDraftWarningLevel,
} from './types';

// Note Templates
export type { NoteTemplate } from './note-templates';

export {
  PROGRESS_NOTE_TEMPLATE,
  INITIAL_EVALUATION_TEMPLATE,
  CRISIS_NOTE_TEMPLATE,
  getNoteTemplate,
  getAllTemplates,
  compileTemplate,
} from './note-templates';

// Hooks
export { useSessionTimer, type UseSessionTimerReturn, type SessionTimerState } from './use-session-timer';
export { useAutoSave, type UseAutoSaveOptions, type UseAutoSaveReturn, type AutoSaveStatus } from './use-auto-save';
