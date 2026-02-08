/**
 * Prompt Registry
 * @module ai/prompts/registry
 */

const VARIABLE_PATTERN = /\{\{([^}]+)\}\}/g;

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  systemPrompt?: string;
  requiredVariables: string[];
  defaultVariables?: Record<string, string>;
  temperature?: number;
  maxTokens?: number;
}

export interface CompiledPrompt {
  content: string;
  systemPrompt?: string;
  template: PromptTemplate;
  variables: Record<string, string>;
}

class PromptRegistry {
  private templates: Map<string, PromptTemplate> = new Map();

  register(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  get(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  has(id: string): boolean {
    return this.templates.has(id);
  }

  list(): string[] {
    return Array.from(this.templates.keys());
  }

  compile(id: string, variables: Record<string, string>): CompiledPrompt {
    const template = this.templates.get(id);
    if (!template) throw new Error(`Prompt template not found: ${id}`);

    const allVariables = { ...template.defaultVariables, ...variables };
    const missing = template.requiredVariables.filter((v) => !(v in allVariables));
    if (missing.length > 0) {
      throw new Error(`Missing required variables: ${missing.join(", ")}`);
    }

    const interpolate = (text: string) =>
      text.replace(VARIABLE_PATTERN, (match, name) => allVariables[name.trim()] ?? match);

    return {
      content: interpolate(template.template),
      systemPrompt: template.systemPrompt ? interpolate(template.systemPrompt) : undefined,
      template,
      variables: allVariables,
    };
  }
}

export const promptRegistry = new PromptRegistry();

// Clinical Patient Analysis Template
const CLINICAL_TEMPLATE = [
  "Analyze this patient's data and generate 2-4 prioritized clinical actions.",
  "",
  "PATIENT: {{patientName}}",
  "DOB: {{dob}}",
  "PRIMARY DIAGNOSIS: {{diagnosis}} - {{diagnosisName}}",
  "MEDICATIONS: {{medications}}",
  "INSURANCE: {{insurance}}",
  "",
  "OUTCOME MEASURE HISTORY:",
  "PHQ-9: {{phq9History}}",
  "GAD-7: {{gad7History}}",
  "",
  "RECENT APPOINTMENTS:",
  "{{recentAppointments}}",
  "",
  "UPCOMING APPOINTMENTS:",
  "{{upcomingAppointments}}",
  "{{hasAppointmentToday}}",
  "",
  "RECENT MESSAGES:",
  "{{recentMessages}}",
  "Unread: {{unreadMessages}}",
  "",
  "BILLING:",
  "Outstanding: ${{outstandingBalance}}",
  "{{lastPaymentDate}}",
  "",
  "No-shows: {{noShowCount}}",
  "",
  "Return ONLY valid JSON array.",
].join("\n");

promptRegistry.register({
  id: "clinical-patient-analysis",
  name: "Clinical Patient Analysis",
  description: "Analyze patient data and generate prioritized clinical actions",
  requiredVariables: [
    "patientName", "dob", "diagnosis", "diagnosisName", "medications", "insurance",
    "phq9History", "gad7History", "recentAppointments", "upcomingAppointments",
    "hasAppointmentToday", "recentMessages", "unreadMessages", "outstandingBalance",
    "lastPaymentDate", "noShowCount",
  ],
  systemPrompt: "You are a clinical decision support AI. Return structured JSON only.",
  template: CLINICAL_TEMPLATE,
  temperature: 0.3,
  maxTokens: 1500,
});

promptRegistry.register({
  id: "marketing-visibility-analysis",
  name: "Marketing Visibility Analysis",
  description: "Analyze provider online visibility",
  requiredVariables: ["providerName", "practiceName", "specialty", "city", "state", "zip"],
  defaultVariables: { websiteUrl: "Not provided" },
  systemPrompt: "You are a healthcare marketing analyst. Return only valid JSON.",
  template: "Analyze online visibility for: {{providerName}} at {{practiceName}}, {{specialty}} in {{city}}, {{state}} {{zip}}. Website: {{websiteUrl}}",
  temperature: 0.2,
  maxTokens: 8192,
});

export function compilePrompt(id: string, variables: Record<string, string>): CompiledPrompt {
  return promptRegistry.compile(id, variables);
}

export function getPromptTemplate(id: string): PromptTemplate | undefined {
  return promptRegistry.get(id);
}

export function hasPromptTemplate(id: string): boolean {
  return promptRegistry.has(id);
}

export function listPromptTemplates(): string[] {
  return promptRegistry.list();
}
