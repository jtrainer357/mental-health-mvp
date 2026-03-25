/**
 * Seed Invoices — One invoice per completed appointment + special cases
 * All amounts derived from CPT_PRICES. No insurance — cash/stripe only.
 */

import type { SeedInvoice } from "./types";
import { CPT_PRICES } from "./types";
import { APPOINTMENTS } from "./appointments";
import { PATIENTS } from "./patients";
import { today } from "./helpers";

// ============================================================================
// BILLING SUMMARY
// ============================================================================

export interface BillingSummary {
  total_outstanding: number;
  collections_this_month: number;
  total_charges_this_month: number;
  total_sessions_this_month: number;
  no_show_count: number;
  cancellation_count: number;
}

// ============================================================================
// GENERATE INVOICES
// ============================================================================

const allInvoices: SeedInvoice[] = [];

// Build a patient lookup for payment_type
const patientPaymentMap = new Map(PATIENTS.map((p) => [p.id, p.payment_type]));

// Special-case patient IDs for outstanding balances
const UNPAID_LISA_APT_INDEX = 2; // her 2nd completed appointment
const PARTIAL_KEVIN_APT_INDEX = 3; // his 3rd completed appointment
const PENDING_CARMEN_APT_INDEX = 4; // her most recent completed appointment

// Track which appointments belong to special-case patients for targeted overrides
const lisaCompletedApts: string[] = [];
const kevinCompletedApts: string[] = [];
const carmenCompletedApts: string[] = [];

// First pass: collect completed appointment IDs per special patient
for (const appt of APPOINTMENTS) {
  if (appt.status === "Completed") {
    if (appt.patient_id === "lisa-whitfield") lisaCompletedApts.push(appt.id);
    if (appt.patient_id === "kevin-rhodes") kevinCompletedApts.push(appt.id);
    if (appt.patient_id === "carmen-alvarez") carmenCompletedApts.push(appt.id);
  }
}

// Generate invoices for all completed and no-show appointments
for (const appt of APPOINTMENTS) {
  if (appt.status === "Cancelled" || appt.status === "Scheduled") continue;

  const paymentMethod = patientPaymentMap.get(appt.patient_id) ?? "cash";

  if (appt.status === "No-Show") {
    // No-show fee: $50
    const isDerekNoShow = appt.patient_id === "derek-washington";
    allInvoices.push({
      id: `inv-${appt.id}`,
      patient_id: appt.patient_id,
      patient_name: appt.patient_name,
      appointment_id: appt.id,
      date_of_service: appt.date,
      cpt_code: appt.cpt_code,
      charge_amount: 50,
      insurance_paid: 0,
      patient_responsibility: 50,
      patient_paid: isDerekNoShow ? 0 : 50,
      balance: isDerekNoShow ? 50 : 0,
      status: isDerekNoShow ? "Pending" : "Paid",
      payment_method: paymentMethod,
    });
    continue;
  }

  // Completed appointment — standard invoice
  const chargeAmount = CPT_PRICES[appt.cpt_code] ?? 150;

  // Determine if this is a special-case invoice
  let invoiceStatus: SeedInvoice["status"] = "Paid";
  let patientPaid = chargeAmount;
  let balance = 0;

  // lisa-whitfield: 1 unpaid invoice
  if (
    appt.patient_id === "lisa-whitfield" &&
    appt.id === lisaCompletedApts[UNPAID_LISA_APT_INDEX - 1]
  ) {
    invoiceStatus = "Pending";
    patientPaid = 0;
    balance = chargeAmount;
  }

  // kevin-rhodes: 1 partial payment
  if (
    appt.patient_id === "kevin-rhodes" &&
    appt.id === kevinCompletedApts[PARTIAL_KEVIN_APT_INDEX - 1]
  ) {
    invoiceStatus = "Partial";
    patientPaid = 90;
    balance = chargeAmount - 90;
  }

  // carmen-alvarez: most recent invoice pending
  if (
    appt.patient_id === "carmen-alvarez" &&
    appt.id === carmenCompletedApts[carmenCompletedApts.length - 1]
  ) {
    invoiceStatus = "Pending";
    patientPaid = 0;
    balance = chargeAmount;
  }

  allInvoices.push({
    id: `inv-${appt.id}`,
    patient_id: appt.patient_id,
    patient_name: appt.patient_name,
    appointment_id: appt.id,
    date_of_service: appt.date,
    cpt_code: appt.cpt_code,
    charge_amount: chargeAmount,
    insurance_paid: 0,
    patient_responsibility: chargeAmount,
    patient_paid: patientPaid,
    balance,
    status: invoiceStatus,
    payment_method: paymentMethod,
  });
}

// ============================================================================
// BILLING SUMMARY GENERATOR
// ============================================================================

export function generateBillingSummary(): BillingSummary {
  const currentMonth = today().slice(0, 7); // YYYY-MM

  let totalOutstanding = 0;
  let collectionsThisMonth = 0;
  let totalChargesThisMonth = 0;
  let totalSessionsThisMonth = 0;

  for (const inv of allInvoices) {
    totalOutstanding += inv.balance;

    const invMonth = inv.date_of_service.slice(0, 7);
    if (invMonth === currentMonth) {
      collectionsThisMonth += inv.patient_paid;
      totalChargesThisMonth += inv.charge_amount;
      totalSessionsThisMonth++;
    }
  }

  const noShowCount = APPOINTMENTS.filter((a) => a.status === "No-Show").length;
  const cancellationCount = APPOINTMENTS.filter((a) => a.status === "Cancelled").length;

  return {
    total_outstanding: totalOutstanding,
    collections_this_month: collectionsThisMonth,
    total_charges_this_month: totalChargesThisMonth,
    total_sessions_this_month: totalSessionsThisMonth,
    no_show_count: noShowCount,
    cancellation_count: cancellationCount,
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export const INVOICES: SeedInvoice[] = allInvoices;
