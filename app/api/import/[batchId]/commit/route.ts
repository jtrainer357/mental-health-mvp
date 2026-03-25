/**
 * Import Commit API Endpoint
 * Handles the final commit of imported patient data with Claude AI analysis.
 *
 * POST /api/import/[batchId]/commit
 * - Loads synthetic patient data
 * - Persists all data to Supabase
 * - Runs Claude Substrate analysis on priority patients
 * - Saves priority actions to database
 * - Returns comprehensive import results
 */

import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/src/lib/logger";
import { importCommitSchema } from "@/src/lib/validation";

const log = createLogger("api/import/commit");
import { checkRateLimit } from "@/src/lib/rate-limit";
import { logAudit } from "@/src/lib/audit";
import {
  analyzePatientWithClaude,
  type PatientAnalysisInput,
  type PrioritizedAction,
} from "@/src/lib/ai/claude-substrate";
import { PATIENTS as SYNTHETIC_PATIENTS } from "@/src/lib/data/patients";
import { APPOINTMENTS as SYNTHETIC_APPOINTMENTS } from "@/src/lib/data/appointments";
import { OUTCOME_MEASURES as SYNTHETIC_OUTCOME_MEASURES } from "@/src/lib/data/outcome-measures";
import { MESSAGES as SYNTHETIC_MESSAGES } from "@/src/lib/data/messages";
import { INVOICES as SYNTHETIC_INVOICES } from "@/src/lib/data/billing";
import { createServiceClient } from "@/src/lib/supabase/server";
import type {
  Json,
  PatientInsert,
  AppointmentInsert,
  OutcomeMeasureInsert,
  MessageInsert,
  InvoiceInsert,
  PriorityActionInsert,
  ClinicalTaskInsert,
} from "@/src/lib/supabase/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const startTime = Date.now();

  try {
    // Rate limit the endpoint
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateCheck = checkRateLimit(`import-commit:${ip}`, { maxRequests: 10, windowSeconds: 60 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    const { batchId } = await params;
    const body = await request.json();

    // Validate input (mappings are optional for synthetic data flow)
    const parsed = importCommitSchema.safeParse(body);
    if (!parsed.success) {
      log.warn("Validation warning", { error: parsed.error.flatten() });
    }

    const supabase = createServiceClient();
    const today = new Date().toISOString().split("T")[0];

    // ========================================
    // STEP 1: Get or Create Demo Practice
    // ========================================
    let { data: practice } = await supabase.from("practices").select("id").single();

    if (!practice) {
      const { data: newPractice, error: practiceError } = await supabase
        .from("practices")
        .insert({ name: "Demo Mental Health Practice" })
        .select("id")
        .single();

      if (practiceError) {
        log.error("Failed to create practice", practiceError);
        throw new Error("Failed to create practice");
      }
      practice = newPractice;
    }

    const practiceId = practice.id;

    // ========================================
    // STEP 2: Clear Existing Demo Data (for re-import)
    // ========================================
    // Delete in reverse dependency order
    await supabase.from("clinical_tasks").delete().eq("practice_id", practiceId);
    await supabase.from("priority_actions").delete().eq("practice_id", practiceId);
    await supabase.from("ai_analysis_runs").delete().eq("practice_id", practiceId);
    await supabase.from("invoices").delete().eq("practice_id", practiceId);
    await supabase.from("messages").delete().eq("practice_id", practiceId);
    await supabase.from("outcome_measures").delete().eq("practice_id", practiceId);
    await supabase.from("appointments").delete().eq("practice_id", practiceId);
    await supabase.from("patients").delete().eq("practice_id", practiceId);

    log.info("Cleared existing data for practice", { practiceId });

    // ========================================
    // STEP 3: Insert Patients
    // ========================================
    const patientInserts: PatientInsert[] = SYNTHETIC_PATIENTS.map((p) => ({
      practice_id: practiceId,
      external_id: p.id,
      client_id: p.client_id,
      first_name: p.first_name,
      last_name: p.last_name,
      date_of_birth: p.date_of_birth,
      gender: p.gender,
      email: p.email,
      phone_mobile: p.phone_mobile,
      phone_home: p.phone_home,
      address_street: p.address_street,
      address_city: p.address_city,
      address_state: p.address_state,
      address_zip: p.address_zip,
      insurance_provider: null,
      insurance_member_id: null,
      primary_diagnosis_code: p.primary_diagnosis_code,
      primary_diagnosis_name: p.primary_diagnosis_name,
      secondary_diagnosis_code: p.secondary_diagnosis_code,
      risk_level: p.risk_level,
      medications: p.medications || [],
      treatment_start_date: p.treatment_start_date,
      provider: p.provider,
      status: p.status,
      avatar_url: p.avatar_url,
    }));

    const { data: insertedPatients, error: patientsError } = await supabase
      .from("patients")
      .insert(patientInserts)
      .select("id, external_id");

    if (patientsError) {
      log.error("Failed to insert patients", patientsError);
      throw new Error("Failed to insert patients");
    }

    // Create mapping from external_id to database UUID
    const patientIdMap = new Map<string, string>();
    insertedPatients?.forEach((p) => {
      if (p.external_id) {
        patientIdMap.set(p.external_id, p.id);
      }
    });

    log.info("Inserted patients", { count: insertedPatients?.length || 0 });

    // ========================================
    // STEP 4: Insert Appointments
    // ========================================
    const appointmentInserts: AppointmentInsert[] = SYNTHETIC_APPOINTMENTS.filter((a) =>
      patientIdMap.has(a.patient_id)
    ).map((a) => ({
      practice_id: practiceId,
      patient_id: patientIdMap.get(a.patient_id)!,
      external_id: a.id,
      date: a.date,
      start_time: a.start_time,
      end_time: a.end_time,
      duration_minutes: a.duration_minutes,
      status: a.status,
      service_type: a.service_type,
      cpt_code: a.cpt_code,
      location: a.location,
      notes: a.notes,
    }));

    const { data: insertedAppointments, error: appointmentsError } = await supabase
      .from("appointments")
      .insert(appointmentInserts)
      .select("id, external_id");

    if (appointmentsError) {
      log.error("Failed to insert appointments", appointmentsError);
      throw new Error("Failed to insert appointments");
    }

    // Create appointment ID mapping for invoices
    const appointmentIdMap = new Map<string, string>();
    insertedAppointments?.forEach((a) => {
      if (a.external_id) {
        appointmentIdMap.set(a.external_id, a.id);
      }
    });

    log.info("Inserted appointments", { count: insertedAppointments?.length || 0 });

    // ========================================
    // STEP 5: Insert Outcome Measures
    // ========================================
    const measureInserts: OutcomeMeasureInsert[] = SYNTHETIC_OUTCOME_MEASURES.filter((m) =>
      patientIdMap.has(m.patient_id)
    ).map((m) => ({
      practice_id: practiceId,
      patient_id: patientIdMap.get(m.patient_id)!,
      measure_type: m.measure_type,
      score: m.score,
      max_score: m.max_score,
      measurement_date: m.measurement_date,
      administered_by: m.administered_by,
    }));

    const { error: measuresError } = await supabase.from("outcome_measures").insert(measureInserts);

    if (measuresError) {
      log.error("Failed to insert outcome measures", measuresError);
      throw new Error("Failed to insert outcome measures");
    }

    log.info("Inserted outcome measures", { count: measureInserts.length });

    // ========================================
    // STEP 6: Insert Messages
    // ========================================
    const messageInserts: MessageInsert[] = SYNTHETIC_MESSAGES.filter((m) =>
      patientIdMap.has(m.patient_id)
    ).map((m) => ({
      practice_id: practiceId,
      patient_id: patientIdMap.get(m.patient_id)!,
      direction: m.direction,
      channel: m.channel,
      content: m.content,
      timestamp: m.timestamp,
      read: m.read,
    }));

    const { error: messagesError } = await supabase.from("messages").insert(messageInserts);

    if (messagesError) {
      log.error("Failed to insert messages", messagesError);
      throw new Error("Failed to insert messages");
    }

    log.info("Inserted messages", { count: messageInserts.length });

    // ========================================
    // STEP 7: Insert Invoices
    // ========================================
    const invoiceInserts: InvoiceInsert[] = SYNTHETIC_INVOICES.filter((i) =>
      patientIdMap.has(i.patient_id)
    ).map((i) => ({
      practice_id: practiceId,
      patient_id: patientIdMap.get(i.patient_id)!,
      appointment_id: appointmentIdMap.get(i.appointment_id) || null,
      external_id: i.id,
      date_of_service: i.date_of_service,
      cpt_code: i.cpt_code,
      charge_amount: i.charge_amount,
      insurance_paid: i.insurance_paid,
      patient_responsibility: i.patient_responsibility,
      patient_paid: i.patient_paid,
      balance: i.balance,
      status: i.status,
    }));

    const { error: invoicesError } = await supabase.from("invoices").insert(invoiceInserts);

    if (invoicesError) {
      log.error("Failed to insert invoices", invoicesError);
      throw new Error("Failed to insert invoices");
    }

    log.info("Inserted invoices", { count: invoiceInserts.length });

    // ========================================
    // STEP 8: Run Claude Substrate Analysis
    // ========================================
    log.info("Starting Claude substrate analysis");

    const claudeActions: Array<{
      patient_id: string;
      patient_db_id: string;
      patient_name: string;
      actions: PrioritizedAction[];
    }> = [];

    // Analyze priority patients (high-risk + today's appointments)
    const priorityPatients = SYNTHETIC_PATIENTS.filter(
      (p) =>
        p.risk_level === "high" ||
        SYNTHETIC_APPOINTMENTS.some((a) => a.patient_id === p.id && a.date === today)
    ).slice(0, 12); // Limit to 12 for demo speed

    log.info("Analyzing priority patients with Claude", { count: priorityPatients.length });

    for (const patient of priorityPatients) {
      const dbPatientId = patientIdMap.get(patient.id);
      if (!dbPatientId) continue;

      const patientMeasures = SYNTHETIC_OUTCOME_MEASURES.filter((m) => m.patient_id === patient.id);
      const patientAppts = SYNTHETIC_APPOINTMENTS.filter((a) => a.patient_id === patient.id);
      const patientMessages = SYNTHETIC_MESSAGES.filter((m) => m.patient_id === patient.id);
      const patientInvoices = SYNTHETIC_INVOICES.filter((i) => i.patient_id === patient.id);

      const recentAppts = patientAppts
        .filter((a) => new Date(a.date) <= new Date())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10);

      const upcomingAppts = patientAppts
        .filter((a) => new Date(a.date) >= new Date())
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

      const recentMsgs = patientMessages
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 10);

      const outstandingBalance = patientInvoices
        .filter((i) => i.balance > 0)
        .reduce((sum, i) => sum + i.balance, 0);

      const analysisInput: PatientAnalysisInput = {
        patient: {
          id: patient.id,
          first_name: patient.first_name,
          last_name: patient.last_name,
          date_of_birth: patient.date_of_birth,
          primary_diagnosis_code: patient.primary_diagnosis_code,
          primary_diagnosis_name: patient.primary_diagnosis_name,
          medications: patient.medications,
          insurance_provider: "Self-pay",
        },
        outcomeMeasures: patientMeasures.map((m) => ({
          measure_type: m.measure_type,
          score: m.score,
          max_score: m.max_score,
          measurement_date: m.measurement_date,
        })),
        recentAppointments: recentAppts.map((a) => ({
          date: a.date,
          status: a.status,
          service_type: a.service_type,
        })),
        upcomingAppointments: upcomingAppts.map((a) => ({
          date: a.date,
          start_time: a.start_time,
        })),
        recentMessages: recentMsgs.map((m) => ({
          direction: m.direction,
          content: m.content,
          timestamp: m.timestamp,
          read: m.read,
        })),
        billing: {
          outstanding_balance: outstandingBalance,
          last_payment_date: patientInvoices.find((i) => i.status === "Paid")?.date_of_service,
        },
      };

      try {
        const actions = await analyzePatientWithClaude(analysisInput);
        claudeActions.push({
          patient_id: patient.id,
          patient_db_id: dbPatientId,
          patient_name: `${patient.first_name} ${patient.last_name}`,
          actions,
        });
        log.info("Claude generated actions for patient", {
          actionCount: actions.length,
          patientName: `${patient.first_name} ${patient.last_name}`,
        });
      } catch (analysisError: unknown) {
        log.error("Claude analysis failed for patient", analysisError, { patientId: patient.id });
      }

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // ========================================
    // STEP 9: Save Priority Actions to Database
    // ========================================
    const allActionInserts: PriorityActionInsert[] = [];
    const allTaskInserts: ClinicalTaskInsert[] = [];

    for (const patientActions of claudeActions) {
      for (const action of patientActions.actions) {
        const actionInsert: PriorityActionInsert = {
          practice_id: practiceId,
          patient_id: patientActions.patient_db_id,
          urgency: action.urgency,
          title: action.title,
          description: action.description,
          clinical_context: action.clinicalReasoning,
          ai_reasoning: action.clinicalReasoning,
          confidence_score: Math.round(action.confidence * 100),
          timeframe: action.timeframe,
          suggested_actions: action.suggestedActions,
          icon: action.icon,
          status: "pending",
        };
        allActionInserts.push(actionInsert);
      }
    }

    let insertedActions: Array<{ id: string; patient_id: string; suggested_actions: Json | null }> =
      [];
    if (allActionInserts.length > 0) {
      const { data, error: actionsError } = await supabase
        .from("priority_actions")
        .insert(allActionInserts)
        .select("id, patient_id, suggested_actions");

      if (actionsError) {
        log.error("Failed to insert priority actions", actionsError);
        // Don't throw - continue without actions
      } else {
        insertedActions = data || [];
        log.info("Inserted priority actions", { count: insertedActions.length });

        // Generate clinical tasks from actions
        for (const action of insertedActions) {
          const suggestions = action.suggested_actions as string[] | null;
          if (suggestions && Array.isArray(suggestions)) {
            for (const suggestion of suggestions.slice(0, 3)) {
              allTaskInserts.push({
                practice_id: practiceId,
                patient_id: action.patient_id,
                priority_action_id: action.id,
                task_type: inferTaskType(suggestion),
                title: suggestion,
                status: "pending",
              });
            }
          }
        }
      }
    }

    // Insert clinical tasks
    if (allTaskInserts.length > 0) {
      const { error: tasksError } = await supabase.from("clinical_tasks").insert(allTaskInserts);

      if (tasksError) {
        log.error("Failed to insert clinical tasks", tasksError);
      } else {
        log.info("Inserted clinical tasks", { count: allTaskInserts.length });
      }
    }

    // ========================================
    // STEP 10: Record Analysis Run
    // ========================================
    const duration = Math.floor((Date.now() - startTime) / 1000);
    await supabase.from("ai_analysis_runs").insert({
      practice_id: practiceId,
      batch_id: batchId,
      patients_analyzed: claudeActions.length,
      actions_generated: insertedActions.length,
      duration_seconds: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      metadata: {
        urgent_actions: allActionInserts.filter((a) => a.urgency === "urgent").length,
        high_actions: allActionInserts.filter((a) => a.urgency === "high").length,
        tasks_generated: allTaskInserts.length,
      },
    });

    // ========================================
    // STEP 11: Log Audit Event
    // ========================================
    await logAudit({
      action: "create",
      resourceType: "import_batch",
      resourceId: batchId,
      details: {
        patientCount: insertedPatients?.length || 0,
        appointmentCount: insertedAppointments?.length || 0,
        outcomeCount: measureInserts.length,
        messageCount: messageInserts.length,
        invoiceCount: invoiceInserts.length,
        claudeActionsGenerated: insertedActions.length,
        taskCount: allTaskInserts.length,
      },
    });

    // ========================================
    // STEP 12: Return Results
    // ========================================
    return NextResponse.json({
      success: true,
      batchId,
      practiceId,
      imported: {
        patients: insertedPatients?.length || 0,
        appointments: insertedAppointments?.length || 0,
        outcomeMeasures: measureInserts.length,
        messages: messageInserts.length,
        invoices: invoiceInserts.length,
      },
      analysis: {
        patientsAnalyzed: claudeActions.length,
        totalActions: insertedActions.length,
        urgentActions: allActionInserts.filter((a) => a.urgency === "urgent").length,
        highPriorityActions: allActionInserts.filter((a) => a.urgency === "high").length,
      },
      tasksGenerated: allTaskInserts.length,
      durationSeconds: duration,
      // Include sample of Claude-generated actions for display
      sampleActions: claudeActions.slice(0, 5).flatMap((c) =>
        c.actions.slice(0, 2).map((a) => ({
          ...a,
          patient_id: c.patient_id,
          patient_name: c.patient_name,
        }))
      ),
      // Include today's appointments for schedule preview
      todayAppointments: SYNTHETIC_APPOINTMENTS.filter((a) => a.date === today).map((a) => ({
        id: a.id,
        patient_id: a.patient_id,
        patient_name: a.patient_name,
        start_time: a.start_time,
        end_time: a.end_time,
        service_type: a.service_type,
        status: a.status,
      })),
    });
  } catch (error: unknown) {
    log.error("Error in import commit", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function inferTaskType(action: string): string {
  const text = action.toLowerCase();
  if (text.includes("lab") || text.includes("test") || text.includes("bloodwork"))
    return "order_lab";
  if (
    text.includes("message") ||
    text.includes("contact") ||
    text.includes("call") ||
    text.includes("reach out")
  )
    return "send_message";
  if (text.includes("refill") || text.includes("prescription") || text.includes("medication"))
    return "refill_rx";
  if (text.includes("schedule") || text.includes("appointment") || text.includes("follow-up"))
    return "schedule_followup";
  return "general";
}
