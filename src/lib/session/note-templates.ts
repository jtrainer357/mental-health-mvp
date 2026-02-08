/**
 * Note Templates for AI-Generated SOAP Notes
 */

import type { NoteType } from './types';

export interface NoteTemplate {
  type: NoteType;
  name: string;
  description: string;
  systemPrompt: string;
  soapPrompt: string;
  additionalSections?: string[];
}

export const PROGRESS_NOTE_TEMPLATE: NoteTemplate = {
  type: 'progress_note',
  name: 'Progress Note',
  description: 'Standard SOAP format for routine therapy sessions',
  systemPrompt: `You are a clinical documentation assistant helping mental health providers create accurate, compliant progress notes.`,
  soapPrompt: `Generate a clinical progress note in SOAP format based on the session transcript.`,
};

export const INITIAL_EVALUATION_TEMPLATE: NoteTemplate = {
  type: 'initial_evaluation',
  name: 'Initial Evaluation',
  description: 'Comprehensive intake with biopsychosocial history',
  systemPrompt: `You are a clinical documentation assistant helping mental health providers create comprehensive initial psychiatric evaluations.`,
  soapPrompt: `Generate a comprehensive initial psychiatric evaluation based on the intake session transcript.`,
  additionalSections: ['biopsychosocialHistory'],
};

export const CRISIS_NOTE_TEMPLATE: NoteTemplate = {
  type: 'crisis_note',
  name: 'Crisis Note',
  description: 'Crisis intervention with mandatory safety assessment',
  systemPrompt: `You are a clinical documentation assistant helping mental health providers document crisis intervention sessions.`,
  soapPrompt: `Generate a crisis intervention note with mandatory safety assessment based on the session transcript.`,
  additionalSections: ['safetyAssessment', 'safetyPlan'],
};

export function getNoteTemplate(noteType: NoteType): NoteTemplate {
  switch (noteType) {
    case 'initial_evaluation': return INITIAL_EVALUATION_TEMPLATE;
    case 'crisis_note': return CRISIS_NOTE_TEMPLATE;
    default: return PROGRESS_NOTE_TEMPLATE;
  }
}

export function getAllTemplates(): NoteTemplate[] {
  return [PROGRESS_NOTE_TEMPLATE, INITIAL_EVALUATION_TEMPLATE, CRISIS_NOTE_TEMPLATE];
}

export function compileTemplate(template: NoteTemplate, variables: Record<string, string>): string {
  let compiled = template.soapPrompt;
  for (const [key, value] of Object.entries(variables)) {
    compiled = compiled.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return compiled;
}
