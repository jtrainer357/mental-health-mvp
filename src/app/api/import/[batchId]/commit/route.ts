/**
 * Import Commit API Endpoint
 * Handles the final commit of imported patient data with Claude AI analysis.
 *
 * POST /api/import/[batchId]/commit
 * - Loads synthetic patient data for demo
 * - Runs Claude Substrate analysis on priority patients
 * - Returns comprehensive import results
 */

import { NextRequest, NextResponse } from "next/server";
import { importCommitSchema } from "@/src/lib/validation";
import { checkRateLimit } from "@/src/lib/rate-limit";
import { logAudit } from "@/src/lib/audit";
import { generateAllImportTasks, type SubstrateTask } from "@/src/lib/substrate/import-trigger";
import {
  analyzePatientWithClaude,
  type PatientAnalysisInput,
  type PrioritizedAction,
} from "@/src/lib/ai/claude-substrate";
import { SYNTHETIC_PATIENTS } from "@/src/lib/data/synthetic-patients";
import { SYNTHETIC_APPOINTMENTS } from "@/src/lib/data/synthetic-appointments";
import { SYNTHETIC_OUTCOME_MEASURES } from "@/src/lib/data/synthetic-outcome-measures";
import { SYNTHETIC_MESSAGES } from "@/src/lib/data/synthetic-messages";
import { SYNTHETIC_INVOICES } from "@/src/lib/data/synthetic-billing";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
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
      // For demo, we can proceed without strict validation
      console.warn("Validation warning:", parsed.error.flatten());
    }

    const practiceId = "demo-practice-id";
    const today = new Date().toISOString().split("T")[0];

    // ========================================
    // STEP 1: Load Synthetic Data
    // ========================================
    const patients = SYNTHETIC_PATIENTS;
    const appointments = SYNTHETIC_APPOINTMENTS;
    const outcomeMeasures = SYNTHETIC_OUTCOME_MEASURES;
    const messages = SYNTHETIC_MESSAGES;
    const invoices = SYNTHETIC_INVOICES;

    console.warn(
      `[Import] Loaded ${patients.length} patients, ${appointments.length} appointments`
    );

    // ========================================
    // STEP 2: Run Claude Substrate Analysis
    // ========================================
    const claudeActions: Array<{
      patient_id: string;
      patient_name: string;
      actions: PrioritizedAction[];
    }> = [];

    // Analyze priority patients (high-risk + today's appointments)
    const priorityPatients = patients
      .filter(
        (p) =>
          p.risk_level === "high" ||
          appointments.some((a) => a.patient_id === p.id && a.date === today)
      )
      .slice(0, 12); // Limit to 12 for demo speed

    console.warn(`[Import] Analyzing ${priorityPatients.length} priority patients with Claude...`);

    for (const patient of priorityPatients) {
      const patientMeasures = outcomeMeasures.filter((m) => m.patient_id === patient.id);
      const patientAppts = appointments.filter((a) => a.patient_id === patient.id);
      const patientMessages = messages.filter((m) => m.patient_id === patient.id);
      const patientInvoices = invoices.filter((i) => i.patient_id === patient.id);

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
          insurance_provider: patient.insurance_provider,
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
          patient_name: `${patient.first_name} ${patient.last_name}`,
          actions,
        });
        console.warn(
          `[Import] Claude generated ${actions.length} actions for ${patient.first_name} ${patient.last_name}`
        );
      } catch (error) {
        console.error(`[Import] Claude analysis failed for ${patient.id}:`, error);
      }

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // ========================================
    // STEP 3: Generate Import Tasks
    // ========================================
    const importTasks: SubstrateTask[] = generateAllImportTasks(
      patients.map((p) => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        practice_id: practiceId,
      })),
      practiceId,
      batchId
    );

    // ========================================
    // STEP 4: Log Audit Event
    // ========================================
    await logAudit({
      action: "create",
      resourceType: "import_batch",
      resourceId: batchId,
      metadata: {
        patientCount: patients.length,
        appointmentCount: appointments.length,
        outcomeCount: outcomeMeasures.length,
        messageCount: messages.length,
        invoiceCount: invoices.length,
        claudeActionsGenerated: claudeActions.reduce((sum, c) => sum + c.actions.length, 0),
        taskCount: importTasks.length,
      },
    });

    // ========================================
    // STEP 5: Return Results
    // ========================================
    return NextResponse.json({
      success: true,
      batchId,
      imported: {
        patients: patients.length,
        appointments: appointments.length,
        outcomeMeasures: outcomeMeasures.length,
        messages: messages.length,
        invoices: invoices.length,
      },
      analysis: {
        patientsAnalyzed: claudeActions.length,
        totalActions: claudeActions.reduce((sum, c) => sum + c.actions.length, 0),
        urgentActions: claudeActions.flatMap((c) => c.actions).filter((a) => a.urgency === "urgent")
          .length,
        highPriorityActions: claudeActions
          .flatMap((c) => c.actions)
          .filter((a) => a.urgency === "high").length,
      },
      tasksGenerated: importTasks.length,
      // Include sample of Claude-generated actions for display
      sampleActions: claudeActions.slice(0, 5).flatMap((c) =>
        c.actions.slice(0, 2).map((a) => ({
          ...a,
          patient_id: c.patient_id,
          patient_name: c.patient_name,
        }))
      ),
      // Include today's appointments for schedule preview
      todayAppointments: appointments
        .filter((a) => a.date === today)
        .map((a) => ({
          id: a.id,
          patient_id: a.patient_id,
          patient_name: a.patient_name,
          start_time: a.start_time,
          end_time: a.end_time,
          service_type: a.service_type,
          status: a.status,
        })),
    });
  } catch (error) {
    // Log full error internally for debugging
    console.error("Error in import commit:", error);

    // Return generic error to client - don't leak internal details
    return NextResponse.json(
      {
        error: "Failed to commit import",
        message: "An unexpected error occurred. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
