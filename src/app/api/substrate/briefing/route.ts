/**
 * Pre-Session Briefing API Route
 * Generates AI-powered briefings for upcoming patient sessions.
 *
 * @module app/api/substrate/briefing
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClinicalFallbackChain } from "@/lib/ai/providers";
import { CLINICAL_THRESHOLDS } from "@/lib/triggers/trigger-types";
import type {
  PreSessionBriefingData,
  OutcomeScore,
  Medication,
} from "@/components/substrate/PreSessionBriefing";

/**
 * GET /api/substrate/briefing
 * Fetches pre-session briefing for a patient with an appointment today
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const patientId = searchParams.get("patientId");
  const practiceId = searchParams.get("practiceId");
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  if (!patientId || !practiceId) {
    return NextResponse.json(
      { error: "Missing patientId or practiceId" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // Check if patient has appointment today
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data: appointment } = await supabase
      .from("appointments")
      .select("id, start_time, end_time, appointment_type, status")
      .eq("patient_id", patientId)
      .eq("practice_id", practiceId)
      .gte("start_time", startOfDay)
      .lte("start_time", endOfDay)
      .neq("status", "cancelled")
      .order("start_time", { ascending: true })
      .limit(1)
      .single();

    if (!appointment) {
      return NextResponse.json({
        data: null,
        hasAppointmentToday: false,
      });
    }

    // Fetch patient data
    const { data: patient } = await supabase
      .from("patients")
      .select("id, first_name, last_name, date_of_birth")
      .eq("id", patientId)
      .single();

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Fetch diagnoses
    const { data: diagnoses } = await supabase
      .from("patient_diagnoses")
      .select("diagnosis_code, diagnosis_name")
      .eq("patient_id", patientId)
      .eq("status", "active")
      .limit(5);

    // Fetch outcome measures
    const { data: outcomeMeasures } = await supabase
      .from("outcome_measures")
      .select("measure_type, score, administered_at")
      .eq("patient_id", patientId)
      .order("administered_at", { ascending: false })
      .limit(10);

    // Fetch medications
    const { data: medications } = await supabase
      .from("medications")
      .select("medication_name, dosage, frequency, prescribed_date, refill_due_date")
      .eq("patient_id", patientId)
      .eq("status", "active");

    // Fetch session count
    const { count: sessionCount } = await supabase
      .from("clinical_sessions")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("status", "completed");

    // Fetch last session date
    const { data: lastSession } = await supabase
      .from("clinical_sessions")
      .select("session_date")
      .eq("patient_id", patientId)
      .eq("status", "completed")
      .order("session_date", { ascending: false })
      .limit(1)
      .single();

    // Process outcome scores
    const outcomeScores: OutcomeScore[] = [];
    const measureTypes = ["PHQ-9", "GAD-7", "PCL-5"] as const;

    for (const measureType of measureTypes) {
      const measures = (outcomeMeasures || []).filter(
        (m) => m.measure_type === measureType
      );

      if (measures.length > 0) {
        const current = measures[0];
        const previous = measures[1] || null;
        const threshold = CLINICAL_THRESHOLDS[measureType];

        outcomeScores.push({
          measureType,
          currentScore: current.score,
          previousScore: previous?.score || null,
          maxScore: measureType === "PCL-5" ? 80 : 27,
          severity: getSeverity(current.score, threshold),
          dateAdministered: current.administered_at,
        });
      }
    }

    // Process medications
    const activeMedications: Medication[] = (medications || []).map((med) => ({
      name: med.medication_name,
      dosage: med.dosage,
      frequency: med.frequency,
      prescribedDate: med.prescribed_date,
      refillDue: med.refill_due_date,
    }));

    // Calculate treatment duration
    const treatmentDuration = calculateTreatmentDuration(
      lastSession?.session_date,
      sessionCount || 0
    );

    // Generate AI insights if we have enough data
    let keyInsights: string[] = [];
    let suggestedTopics: string[] = [];
    let riskFactors: string[] = [];

    try {
      const aiResponse = await generateBriefingInsights({
        patientName: `${patient.first_name} ${patient.last_name}`,
        diagnoses: diagnoses || [],
        outcomeScores,
        medications: activeMedications,
        sessionCount: sessionCount || 0,
        lastSessionDate: lastSession?.session_date,
      });

      keyInsights = aiResponse.keyInsights;
      suggestedTopics = aiResponse.suggestedTopics;
      riskFactors = aiResponse.riskFactors;
    } catch (aiError) {
      // Fall back to template-based insights
      const templateInsights = generateTemplateInsights({
        outcomeScores,
        medications: activeMedications,
        sessionCount: sessionCount || 0,
      });

      keyInsights = templateInsights.keyInsights;
      suggestedTopics = templateInsights.suggestedTopics;
      riskFactors = templateInsights.riskFactors;
    }

    const briefingData: PreSessionBriefingData = {
      patientId,
      patientName: `${patient.first_name} ${patient.last_name}`,
      appointmentTime: new Date(appointment.start_time).toLocaleTimeString(
        "en-US",
        { hour: "numeric", minute: "2-digit" }
      ),
      appointmentType: appointment.appointment_type || "Session",
      lastSessionDate: lastSession?.session_date || null,
      sessionCount: sessionCount || 0,
      treatmentDuration,
      primaryDiagnosis: (diagnoses || []).map((d) => d.diagnosis_name),
      outcomeScores,
      activeMedications,
      recentNotes: [],
      keyInsights,
      suggestedTopics,
      riskFactors,
    };

    return NextResponse.json({
      data: briefingData,
      hasAppointmentToday: true,
    });
  } catch (error) {
    console.error("Error generating pre-session briefing:", error);
    return NextResponse.json(
      { error: "Failed to generate briefing" },
      { status: 500 }
    );
  }
}

/**
 * Get severity level from score and thresholds
 */
function getSeverity(
  score: number,
  threshold: { elevated: number; high: number; severe: number }
): OutcomeScore["severity"] {
  if (score >= threshold.severe) return "severe";
  if (score >= threshold.high) return "moderately_severe";
  if (score >= threshold.elevated) return "moderate";
  if (score >= threshold.elevated / 2) return "mild";
  return "minimal";
}

/**
 * Calculate treatment duration string
 */
function calculateTreatmentDuration(
  lastSessionDate: string | undefined,
  sessionCount: number
): string {
  if (sessionCount === 0) return "New patient";
  if (!lastSessionDate) return `${sessionCount} session${sessionCount > 1 ? "s" : ""}`;

  const firstSessionDate = new Date();
  firstSessionDate.setMonth(firstSessionDate.getMonth() - Math.ceil(sessionCount / 4));

  const now = new Date();
  const diff = now.getTime() - firstSessionDate.getTime();
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));

  if (months < 1) return `${sessionCount} session${sessionCount > 1 ? "s" : ""} this month`;
  if (months < 12) return `${months} month${months > 1 ? "s" : ""}`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""}`;
}

/**
 * Generate AI-powered insights for the briefing
 */
async function generateBriefingInsights(context: {
  patientName: string;
  diagnoses: Array<{ diagnosis_code: string; diagnosis_name: string }>;
  outcomeScores: OutcomeScore[];
  medications: Medication[];
  sessionCount: number;
  lastSessionDate: string | undefined;
}): Promise<{
  keyInsights: string[];
  suggestedTopics: string[];
  riskFactors: string[];
}> {
  const aiProvider = createClinicalFallbackChain();

  const prompt = `You are a clinical decision support assistant preparing a pre-session briefing for a mental health provider.

Patient Context:
- Name: ${context.patientName}
- Session count: ${context.sessionCount}
- Last session: ${context.lastSessionDate || "First session"}
- Diagnoses: ${context.diagnoses.map((d) => d.diagnosis_name).join(", ") || "None documented"}
- Active medications: ${context.medications.map((m) => `${m.name} ${m.dosage}`).join(", ") || "None"}
- Outcome scores: ${context.outcomeScores.map((s) => `${s.measureType}: ${s.currentScore}/${s.maxScore} (${s.severity})`).join(", ") || "None available"}

Generate a brief clinical summary with:
1. 2-3 key insights about the patient's current status
2. 2-3 suggested discussion topics for today's session
3. Any risk factors that should be addressed (if none, return empty array)

Respond in JSON format:
{
  "keyInsights": ["insight 1", "insight 2"],
  "suggestedTopics": ["topic 1", "topic 2"],
  "riskFactors": ["risk 1"] or []
}

Keep each item concise (under 100 characters). Focus on actionable clinical information.`;

  const response = await aiProvider.complete(prompt, {
    maxTokens: 500,
    temperature: 0.3,
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      keyInsights: parsed.keyInsights || [],
      suggestedTopics: parsed.suggestedTopics || [],
      riskFactors: parsed.riskFactors || [],
    };
  } catch {
    throw new Error("Failed to parse AI response");
  }
}

/**
 * Generate template-based insights as fallback
 */
function generateTemplateInsights(context: {
  outcomeScores: OutcomeScore[];
  medications: Medication[];
  sessionCount: number;
}): {
  keyInsights: string[];
  suggestedTopics: string[];
  riskFactors: string[];
} {
  const keyInsights: string[] = [];
  const suggestedTopics: string[] = [];
  const riskFactors: string[] = [];

  // Analyze outcome scores
  for (const score of context.outcomeScores) {
    if (score.severity === "severe" || score.severity === "moderately_severe") {
      riskFactors.push(
        `Elevated ${score.measureType} score (${score.currentScore}) indicates ${score.severity.replace("_", " ")} symptoms`
      );
    }

    if (score.previousScore !== null) {
      const diff = score.currentScore - score.previousScore;
      if (diff >= 5) {
        keyInsights.push(
          `${score.measureType} increased by ${diff} points since last assessment`
        );
      } else if (diff <= -5) {
        keyInsights.push(
          `${score.measureType} improved by ${Math.abs(diff)} points since last assessment`
        );
      }
    }
  }

  // Check medication refills
  for (const med of context.medications) {
    if (med.refillDue) {
      const refillDate = new Date(med.refillDue);
      const now = new Date();
      const daysUntilRefill = Math.ceil(
        (refillDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilRefill <= 7) {
        suggestedTopics.push(`${med.name} refill due in ${daysUntilRefill} days`);
      }
    }
  }

  // Add default suggestions based on session count
  if (context.sessionCount <= 3) {
    suggestedTopics.push("Review treatment goals and expectations");
    suggestedTopics.push("Assess therapeutic alliance");
  } else {
    suggestedTopics.push("Review progress toward treatment goals");
  }

  // Ensure we have some content
  if (keyInsights.length === 0) {
    keyInsights.push("Review recent symptom patterns and functioning");
  }

  return { keyInsights, suggestedTopics, riskFactors };
}
