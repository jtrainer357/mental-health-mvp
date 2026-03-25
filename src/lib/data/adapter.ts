/**
 * Data Adapter — Converts seed data to Supabase database types
 * This is the bridge between the unified seed data and the query layer.
 */

import { PATIENTS } from "./patients";
import { APPOINTMENTS } from "./appointments";
import { OUTCOME_MEASURES } from "./outcome-measures";
import { MESSAGES } from "./messages";
import { INVOICES } from "./billing";
import { PRIORITY_ACTIONS } from "./priority-actions";
import { today, toISO } from "./helpers";
import type {
  SeedPatient,
  SeedAppointment,
  SeedInvoice,
  SeedMessage,
  SeedOutcomeMeasure,
} from "./types";
import type {
  Patient,
  Appointment,
  OutcomeMeasure,
  Message,
  Invoice,
  Communication,
} from "@/src/lib/supabase/types";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

// ============================================================================
// UUID GENERATION (deterministic from seed string)
// ============================================================================

function generateDemoUUID(seed: string): string {
  const hash = seed.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
  const hex = (num: number, len: number) =>
    Math.abs(num).toString(16).padStart(len, "0").slice(0, len);

  return [
    hex(hash, 8),
    hex(hash * 2, 4),
    "4" + hex(hash * 3, 3),
    hex((hash % 4) + 8, 1) + hex(hash * 4, 3),
    hex(hash * 5, 12),
  ].join("-");
}

// ============================================================================
// CONVERTERS
// ============================================================================

export function seedPatientToDb(patient: SeedPatient): Patient {
  return {
    id: generateDemoUUID(patient.id),
    practice_id: DEMO_PRACTICE_ID,
    external_id: patient.id,
    client_id: patient.client_id,
    first_name: patient.first_name,
    last_name: patient.last_name,
    date_of_birth: patient.date_of_birth,
    gender: patient.gender,
    email: patient.email,
    phone_mobile: patient.phone_mobile,
    phone_home: patient.phone_home || null,
    address_street: patient.address_street,
    address_city: patient.address_city,
    address_state: patient.address_state,
    address_zip: patient.address_zip,
    insurance_provider: null,
    insurance_member_id: null,
    primary_diagnosis_code: patient.primary_diagnosis_code,
    primary_diagnosis_name: patient.primary_diagnosis_name,
    secondary_diagnosis_code: patient.secondary_diagnosis_code || null,
    risk_level: patient.risk_level,
    medications: patient.medications.length > 0 ? patient.medications : null,
    treatment_start_date: patient.treatment_start_date,
    provider: patient.provider,
    status: patient.status as "Active" | "Inactive" | "Discharged",
    avatar_url: patient.avatar_url || null,
    created_at: patient.date_created + "T00:00:00Z",
    updated_at: new Date().toISOString(),
  };
}

export function seedAppointmentToDb(apt: SeedAppointment, patientUUID: string): Appointment {
  return {
    id: generateDemoUUID(apt.id),
    practice_id: DEMO_PRACTICE_ID,
    patient_id: patientUUID,
    external_id: apt.id,
    date: apt.date,
    start_time: apt.start_time,
    end_time: apt.end_time,
    duration_minutes: apt.duration_minutes,
    status: apt.status,
    service_type: apt.service_type,
    cpt_code: apt.cpt_code,
    location: apt.location,
    notes: apt.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function seedOutcomeMeasureToDb(
  measure: SeedOutcomeMeasure,
  patientUUID: string
): OutcomeMeasure {
  return {
    id: generateDemoUUID(measure.id),
    practice_id: DEMO_PRACTICE_ID,
    patient_id: patientUUID,
    measure_type: measure.measure_type,
    score: measure.score,
    max_score: measure.max_score,
    measurement_date: measure.measurement_date,
    administered_by: measure.administered_by,
    notes: null,
    created_at: measure.measurement_date + "T00:00:00Z",
  };
}

export function seedMessageToDb(msg: SeedMessage, patientUUID: string): Message {
  return {
    id: generateDemoUUID(msg.id),
    practice_id: DEMO_PRACTICE_ID,
    patient_id: patientUUID,
    direction: msg.direction,
    channel: msg.channel,
    content: msg.content,
    timestamp: msg.timestamp,
    read: msg.read,
    read_at: msg.read ? msg.timestamp : null,
    created_at: msg.timestamp,
  };
}

export function seedInvoiceToDb(
  inv: SeedInvoice,
  patientUUID: string,
  appointmentUUID: string | null
): Invoice {
  return {
    id: generateDemoUUID(inv.id),
    practice_id: DEMO_PRACTICE_ID,
    patient_id: patientUUID,
    appointment_id: appointmentUUID,
    external_id: inv.id,
    date_of_service: inv.date_of_service,
    cpt_code: inv.cpt_code,
    charge_amount: inv.charge_amount,
    insurance_paid: 0,
    patient_responsibility: inv.patient_responsibility,
    patient_paid: inv.patient_paid,
    balance: inv.balance,
    status: inv.status,
    created_at: inv.date_of_service + "T00:00:00Z",
    updated_at: new Date().toISOString(),
  };
}

// ============================================================================
// PATIENT CACHE & LOOKUPS
// ============================================================================

const patientCache = new Map<string, Patient>();

export function getDemoPatients(): Patient[] {
  return PATIENTS.map((p) => {
    if (!patientCache.has(p.id)) {
      patientCache.set(p.id, seedPatientToDb(p));
    }
    return patientCache.get(p.id)!;
  });
}

export function getPatientUUID(externalId: string): string {
  const cached = patientCache.get(externalId);
  if (cached) return cached.id;
  return generateDemoUUID(externalId);
}

export function getDemoPatientByExternalId(externalId: string): Patient | null {
  const patient = PATIENTS.find((p) => p.id === externalId);
  if (!patient) return null;
  if (!patientCache.has(externalId)) {
    patientCache.set(externalId, seedPatientToDb(patient));
  }
  return patientCache.get(externalId)!;
}

export function getDemoPatientByUUID(uuid: string): Patient | null {
  for (const [, patient] of patientCache) {
    if (patient.id === uuid) return patient;
  }
  const demoPatients = getDemoPatients();
  return demoPatients.find((p) => p.id === uuid) || null;
}

export function isDemoPatientUUID(uuid: string): boolean {
  return getDemoPatientByUUID(uuid) !== null;
}

export function getExternalIdFromUUID(uuid: string): string | null {
  const patient = getDemoPatientByUUID(uuid);
  return patient?.external_id || null;
}

// ============================================================================
// APPOINTMENT LOOKUPS
// ============================================================================

export function getDemoPatientAppointments(patientExternalId: string): Appointment[] {
  const patientUUID = getPatientUUID(patientExternalId);
  return APPOINTMENTS.filter((apt) => apt.patient_id === patientExternalId)
    .map((apt) => seedAppointmentToDb(apt, patientUUID))
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.start_time.localeCompare(a.start_time);
    });
}

export function getDemoTodayAppointments(): Array<
  Appointment & {
    patient: Pick<
      Patient,
      "id" | "first_name" | "last_name" | "avatar_url" | "risk_level" | "date_of_birth"
    >;
  }
> {
  const todayStr = today();
  const todayAppointments = APPOINTMENTS.filter((apt) => apt.date === todayStr);

  return todayAppointments
    .map((apt) => {
      const patientUUID = getPatientUUID(apt.patient_id);
      const patient = getDemoPatientByExternalId(apt.patient_id);
      return {
        ...seedAppointmentToDb(apt, patientUUID),
        patient: {
          id: patient?.id || patientUUID,
          first_name: patient?.first_name || apt.patient_name.split(" ")[0] || "",
          last_name: patient?.last_name || apt.patient_name.split(" ").slice(1).join(" ") || "",
          avatar_url: patient?.avatar_url || null,
          risk_level: patient?.risk_level || "low",
          date_of_birth: patient?.date_of_birth || "1990-01-01",
        },
      };
    })
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function getDemoUpcomingAppointments(days: number = 28): Array<
  Appointment & {
    patient: Pick<
      Patient,
      "id" | "first_name" | "last_name" | "avatar_url" | "risk_level" | "date_of_birth"
    >;
  }
> {
  const todayStr = today();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  const endStr = endDate.toISOString().split("T")[0]!;

  const upcomingAppointments = APPOINTMENTS.filter(
    (apt) => apt.date >= todayStr && apt.date <= endStr
  );

  return upcomingAppointments
    .map((apt) => {
      const patientUUID = getPatientUUID(apt.patient_id);
      const patient = getDemoPatientByExternalId(apt.patient_id);
      return {
        ...seedAppointmentToDb(apt, patientUUID),
        patient: {
          id: patient?.id || patientUUID,
          first_name: patient?.first_name || apt.patient_name.split(" ")[0] || "",
          last_name: patient?.last_name || apt.patient_name.split(" ").slice(1).join(" ") || "",
          avatar_url: patient?.avatar_url || null,
          risk_level: patient?.risk_level || "low",
          date_of_birth: patient?.date_of_birth || "1990-01-01",
        },
      };
    })
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });
}

// ============================================================================
// OTHER DATA LOOKUPS
// ============================================================================

export function getDemoPatientOutcomeMeasures(patientExternalId: string): OutcomeMeasure[] {
  const patientUUID = getPatientUUID(patientExternalId);
  return OUTCOME_MEASURES.filter((m) => m.patient_id === patientExternalId)
    .map((m) => seedOutcomeMeasureToDb(m, patientUUID))
    .sort((a, b) => b.measurement_date.localeCompare(a.measurement_date));
}

export function getDemoPatientMessages(patientExternalId: string): Message[] {
  const patientUUID = getPatientUUID(patientExternalId);
  return MESSAGES.filter((m) => m.patient_id === patientExternalId)
    .map((m) => seedMessageToDb(m, patientUUID))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getDemoPatientInvoices(patientExternalId: string): Invoice[] {
  const patientUUID = getPatientUUID(patientExternalId);
  return INVOICES.filter((inv) => inv.patient_id === patientExternalId)
    .map((inv) => {
      const apt = APPOINTMENTS.find((a) => a.id === inv.appointment_id);
      const aptUUID = apt ? generateDemoUUID(apt.id) : null;
      return seedInvoiceToDb(inv, patientUUID, aptUUID);
    })
    .sort((a, b) => b.date_of_service.localeCompare(a.date_of_service));
}

export function getDemoPatientPriorityActions(patientExternalId: string) {
  return PRIORITY_ACTIONS.filter((a) => a.patient_id === patientExternalId);
}

// ============================================================================
// COMMUNICATIONS (unified inbox format)
// ============================================================================

export function seedMessageToCommunication(msg: SeedMessage, patientUUID: string): Communication {
  const patient = getDemoPatientByExternalId(msg.patient_id);
  const isOutbound = msg.direction === "outbound";

  return {
    id: generateDemoUUID(msg.id + "-comm"),
    practice_id: DEMO_PRACTICE_ID,
    patient_id: patientUUID,
    channel: msg.channel,
    direction: msg.direction,
    sender: isOutbound
      ? "Dr. Sarah Chen"
      : patient
        ? `${patient.first_name} ${patient.last_name}`
        : null,
    recipient: isOutbound
      ? patient
        ? `${patient.first_name} ${patient.last_name}`
        : null
      : "Dr. Sarah Chen",
    sender_email: isOutbound ? "dr.chen@practice.com" : patient?.email || null,
    recipient_email: isOutbound ? patient?.email || null : "dr.chen@practice.com",
    sender_phone: isOutbound ? "555-0100" : patient?.phone_mobile || null,
    recipient_phone: isOutbound ? patient?.phone_mobile || null : "555-0100",
    message_body: msg.content,
    is_read: msg.read,
    sent_at: msg.timestamp,
    created_at: msg.timestamp,
  };
}

export function getDemoCommunicationThreads(): Array<{
  patient: Pick<Patient, "id" | "first_name" | "last_name" | "avatar_url">;
  messages: Communication[];
  unreadCount: number;
  lastMessage: Communication | null;
}> {
  const patientMap = new Map<
    string,
    {
      patient: Pick<Patient, "id" | "first_name" | "last_name" | "avatar_url">;
      messages: Communication[];
      unreadCount: number;
    }
  >();

  MESSAGES.forEach((msg) => {
    const patientId = msg.patient_id;

    if (!patientMap.has(patientId)) {
      const patientUUID = getPatientUUID(patientId);
      const patient = getDemoPatientByExternalId(patientId);

      patientMap.set(patientId, {
        patient: {
          id: patientUUID,
          first_name: patient?.first_name || "",
          last_name: patient?.last_name || "",
          avatar_url: patient?.avatar_url || null,
        },
        messages: [],
        unreadCount: 0,
      });
    }

    const thread = patientMap.get(patientId)!;
    thread.messages.push(seedMessageToCommunication(msg, getPatientUUID(patientId)));
    if (!msg.read && msg.direction === "inbound") {
      thread.unreadCount++;
    }
  });

  return Array.from(patientMap.values())
    .map((thread) => ({
      ...thread,
      lastMessage: thread.messages[0] || null,
    }))
    .sort((a, b) => {
      const aTime = a.lastMessage?.sent_at || "";
      const bTime = b.lastMessage?.sent_at || "";
      return bTime.localeCompare(aTime);
    });
}
