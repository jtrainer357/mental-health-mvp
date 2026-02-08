/**
 * AI Note Templates for Clinical Documentation
 * @module session/note-templates
 */

import type { NoteType } from "./types";

export interface NoteTemplate {
  type: NoteType;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  sections: string[];
}

/**
 * Progress Note Template
 * Standard SOAP format for ongoing therapy sessions
 */
export const PROGRESS_NOTE_TEMPLATE: NoteTemplate = {
  type: "progress_note",
  name: "Progress Note",
  description: "Standard SOAP format for therapy sessions",
  sections: ["subjective", "objective", "assessment", "plan"],
  systemPrompt: `You are a clinical documentation assistant for a mental health practice.
Generate professional, HIPAA-compliant clinical documentation in SOAP format.
Use clear, objective clinical language. Avoid jargon and be specific.
Include relevant clinical observations and therapeutic interventions.
Do not include any information not provided in the session notes.`,
  userPromptTemplate: `Generate a clinical progress note for the following session:

Patient Context:
- Diagnoses: {{diagnoses}}
- Current Medications: {{medications}}
- Previous Session Summary: {{previousSession}}

Session Details:
- Date: {{sessionDate}}
- Duration: {{duration}} minutes
- Session Type: Individual Psychotherapy

Clinician Notes:
{{clinicianNotes}}

Interventions Used:
{{interventions}}

Risk Assessment:
{{riskAssessment}}

Please generate a professional SOAP note with the following sections:
1. Subjective: Patient's self-reported symptoms, concerns, and progress
2. Objective: Clinician observations, mental status, affect, behavior
3. Assessment: Clinical formulation, progress toward treatment goals
4. Plan: Next steps, homework, medication considerations, next appointment`,
};

/**
 * Initial Evaluation Template
 * Comprehensive intake assessment
 */
export const INITIAL_EVALUATION_TEMPLATE: NoteTemplate = {
  type: "initial_evaluation",
  name: "Initial Evaluation",
  description: "Comprehensive psychiatric intake assessment",
  sections: [
    "presenting_problem",
    "history",
    "mental_status",
    "assessment",
    "plan",
  ],
  systemPrompt: `You are a clinical documentation assistant for psychiatric evaluations.
Generate a comprehensive initial evaluation following standard psychiatric format.
Be thorough but concise. Use professional clinical terminology.
Include all relevant historical information and current presentation.
Formulate a clear diagnostic impression and treatment recommendations.`,
  userPromptTemplate: `Generate an initial psychiatric evaluation for the following intake:

Demographics:
- Age: {{age}}
- Gender: {{gender}}

Referral Source: {{referralSource}}

Chief Complaint:
{{chiefComplaint}}

History of Present Illness:
{{historyPresentIllness}}

Past Psychiatric History:
{{pastPsychHistory}}

Medical History:
{{medicalHistory}}

Family Psychiatric History:
{{familyHistory}}

Social History:
{{socialHistory}}

Substance Use History:
{{substanceHistory}}

Mental Status Examination:
{{mentalStatusExam}}

Risk Assessment:
{{riskAssessment}}

Please generate a comprehensive initial evaluation including:
1. Identifying Information and Chief Complaint
2. History of Present Illness
3. Past Psychiatric and Medical History
4. Family and Social History
5. Mental Status Examination
6. Diagnostic Impression (with ICD-10 codes)
7. Treatment Recommendations and Plan`,
};

/**
 * Crisis Note Template
 * Documentation for crisis interventions
 */
export const CRISIS_NOTE_TEMPLATE: NoteTemplate = {
  type: "crisis_note",
  name: "Crisis Note",
  description: "Crisis intervention documentation",
  sections: ["crisis_presentation", "intervention", "disposition", "safety_plan"],
  systemPrompt: `You are a clinical documentation assistant for crisis intervention.
Generate thorough crisis documentation that captures the clinical situation,
interventions provided, and disposition planning.
Be specific about risk factors, protective factors, and safety planning.
Document all clinical decision-making clearly.`,
  userPromptTemplate: `Generate a crisis intervention note for the following encounter:

Crisis Presentation:
- Date/Time: {{dateTime}}
- Setting: {{setting}}
- Precipitating Event: {{precipitant}}

Patient Presentation:
{{presentation}}

Risk Assessment:
- Suicidal Ideation: {{suicidalIdeation}}
- Homicidal Ideation: {{homicidalIdeation}}
- Risk Factors: {{riskFactors}}
- Protective Factors: {{protectiveFactors}}

Interventions Provided:
{{interventions}}

Collateral Contacts:
{{collateral}}

Disposition:
{{disposition}}

Please generate a crisis note including:
1. Crisis Presentation and Precipitating Factors
2. Detailed Risk Assessment
3. Clinical Interventions Provided
4. Safety Planning
5. Disposition and Follow-up Plan`,
};

/**
 * Treatment Plan Template
 */
export const TREATMENT_PLAN_TEMPLATE: NoteTemplate = {
  type: "treatment_plan",
  name: "Treatment Plan",
  description: "Individualized treatment planning",
  sections: ["problems", "goals", "objectives", "interventions"],
  systemPrompt: `You are a clinical documentation assistant for treatment planning.
Generate measurable, achievable treatment goals using SMART criteria.
Include specific interventions and timeframes.
Align goals with presenting problems and diagnoses.`,
  userPromptTemplate: `Generate a treatment plan for the following patient:

Diagnoses:
{{diagnoses}}

Presenting Problems:
{{presentingProblems}}

Strengths and Resources:
{{strengths}}

Barriers to Treatment:
{{barriers}}

Patient Goals:
{{patientGoals}}

Please generate a treatment plan including:
1. Problem List (linked to diagnoses)
2. Long-term Goals (6-12 months)
3. Short-term Objectives (measurable, with timeframes)
4. Planned Interventions
5. Frequency and Duration of Treatment
6. Criteria for Discharge`,
};

/**
 * Get template by note type
 */
export function getNoteTemplate(noteType: NoteType): NoteTemplate | null {
  switch (noteType) {
    case "progress_note":
      return PROGRESS_NOTE_TEMPLATE;
    case "initial_evaluation":
      return INITIAL_EVALUATION_TEMPLATE;
    case "crisis_note":
      return CRISIS_NOTE_TEMPLATE;
    case "treatment_plan":
      return TREATMENT_PLAN_TEMPLATE;
    default:
      return PROGRESS_NOTE_TEMPLATE;
  }
}

/**
 * All available templates
 */
export const NOTE_TEMPLATES: NoteTemplate[] = [
  PROGRESS_NOTE_TEMPLATE,
  INITIAL_EVALUATION_TEMPLATE,
  CRISIS_NOTE_TEMPLATE,
  TREATMENT_PLAN_TEMPLATE,
];

/**
 * Compile a template with provided variables
 */
export function compileNoteTemplate(
  template: NoteTemplate,
  variables: Record<string, string>
): string {
  let prompt = template.userPromptTemplate;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    prompt = prompt.replace(new RegExp(placeholder, "g"), value || "Not provided");
  }

  // Replace any remaining placeholders with "Not provided"
  prompt = prompt.replace(/\{\{[^}]+\}\}/g, "Not provided");

  return prompt;
}

export default NOTE_TEMPLATES;
