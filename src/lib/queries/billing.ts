/**
 * Billing/Invoices Queries
 * Fetches invoice and billing data from Supabase
 *
 * Note: Demo invoices have additional columns not in the base types.
 * We use explicit typing to handle both schemas.
 */

import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import { DEMO_PRACTICE_ID, getDemoToday, getDemoDaysAgo } from "@/src/lib/utils/demo-date";
import { INVOICES as SYNTHETIC_INVOICES } from "@/src/lib/data/billing";

const log = createLogger("queries/billing");

export interface Invoice {
  id: string;
  practice_id: string;
  patient_id: string;
  patient_name: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  date_of_service: string | null;
  service_date_start: string | null;
  service_date_end: string | null;
  cpt_code: string | null;
  description: string | null;
  units: number | null;
  unit_price: number | null;
  subtotal: number | null;
  charge_amount: number;
  insurance_paid: number;
  patient_responsibility: number;
  patient_paid: number;
  amount_paid: number | null;
  balance: number;
  total_due: number | null;
  status: string;
  insurance_provider: string | null;
  insurance_id: string | null;
  created_at: string;
}

export interface InvoiceWithPatient extends Invoice {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export interface BillingSummary {
  totalCharged: number;
  totalCollected: number;
  outstandingAR: number;
  collectionRate: number;
  invoiceCount: number;
  paidCount: number;
  pendingCount: number;
}

/**
 * Get all invoices for a practice
 */
export async function getInvoices(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<InvoiceWithPatient[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .eq("practice_id", practiceId)
    .order("date_of_service", { ascending: false });

  if (error) {
    log.error("Failed to fetch invoices", error, { action: "getInvoices", practiceId });
    throw error;
  }

  return (data || []) as unknown as InvoiceWithPatient[];
}

/**
 * Get invoices within a date range
 */
export async function getInvoicesByDateRange(
  practiceId: string = DEMO_PRACTICE_ID,
  startDate: string,
  endDate: string
): Promise<Invoice[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("practice_id", practiceId)
    .gte("date_of_service", startDate)
    .lte("date_of_service", endDate)
    .order("date_of_service", { ascending: false });

  if (error) {
    log.error("Failed to fetch invoices by date range", error, {
      action: "getInvoicesByDateRange",
      practiceId,
      startDate,
      endDate,
    });
    throw error;
  }

  return (data || []) as unknown as Invoice[];
}

/**
 * Convert synthetic billing summary to query format
 */
function getSyntheticBillingSummary(): BillingSummary {
  const totalCharged = SYNTHETIC_INVOICES.reduce((sum, inv) => sum + (inv.charge_amount || 0), 0);
  const totalCollected = SYNTHETIC_INVOICES.reduce(
    (sum, inv) => sum + (inv.insurance_paid || 0) + (inv.patient_paid || 0),
    0
  );
  const outstandingAR = SYNTHETIC_INVOICES.reduce((sum, inv) => sum + (inv.balance || 0), 0);
  const collectionRate = totalCharged > 0 ? (totalCollected / totalCharged) * 100 : 0;
  const paidCount = SYNTHETIC_INVOICES.filter((inv) => inv.status?.toLowerCase() === "paid").length;
  const pendingCount = SYNTHETIC_INVOICES.filter(
    (inv) => inv.status?.toLowerCase() === "pending"
  ).length;

  return {
    totalCharged,
    totalCollected,
    outstandingAR,
    collectionRate: Math.round(collectionRate),
    invoiceCount: SYNTHETIC_INVOICES.length,
    paidCount,
    pendingCount,
  };
}

/**
 * Get billing summary for a practice (6 month history)
 * Falls back to synthetic data when Supabase is unavailable
 */
export async function getBillingSummary(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<BillingSummary> {
  const supabase = createClient();
  const today = getDemoToday();
  const sixMonthsAgo = getDemoDaysAgo(180);

  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("practice_id", practiceId)
      .gte("date_of_service", sixMonthsAgo)
      .lte("date_of_service", today);

    if (error) {
      log.warn("Failed to fetch billing summary from DB, using synthetic data", {
        action: "getBillingSummary",
        practiceId,
      });
      return getSyntheticBillingSummary();
    }

    // If no data from DB, use synthetic
    if (!data || data.length === 0) {
      return getSyntheticBillingSummary();
    }

    const invoices = data as unknown as Invoice[];

    const totalCharged = invoices.reduce((sum, inv) => sum + (inv.charge_amount || 0), 0);
    const totalCollected = invoices.reduce(
      (sum, inv) => sum + (inv.insurance_paid || 0) + (inv.patient_paid || 0),
      0
    );
    const outstandingAR = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);
    const collectionRate = totalCharged > 0 ? (totalCollected / totalCharged) * 100 : 0;
    const paidCount = invoices.filter((inv) => inv.status?.toLowerCase() === "paid").length;
    const pendingCount = invoices.filter((inv) => inv.status?.toLowerCase() === "pending").length;

    return {
      totalCharged,
      totalCollected,
      outstandingAR,
      collectionRate: Math.round(collectionRate),
      invoiceCount: invoices.length,
      paidCount,
      pendingCount,
    };
  } catch {
    // Fallback to synthetic data on any error
    log.warn("Billing query failed, using synthetic data", { action: "getBillingSummary" });
    return getSyntheticBillingSummary();
  }
}

/**
 * Get patient invoices
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientInvoices(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Invoice[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("date_of_service", { ascending: false });

  if (error) {
    log.error("Failed to fetch patient invoices", error, {
      action: "getPatientInvoices",
      patientId,
    });
    throw error;
  }

  return (data || []) as unknown as Invoice[];
}

/**
 * Get outstanding invoices (balance > 0)
 */
export async function getOutstandingInvoices(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<InvoiceWithPatient[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .eq("practice_id", practiceId)
    .gt("balance", 0)
    .order("balance", { ascending: false });

  if (error) {
    log.error("Failed to fetch outstanding invoices", error, {
      action: "getOutstandingInvoices",
      practiceId,
    });
    throw error;
  }

  return (data || []) as unknown as InvoiceWithPatient[];
}

/**
 * Get monthly billing totals for the past 6 months
 */
export async function getMonthlyBillingTotals(practiceId: string = DEMO_PRACTICE_ID): Promise<
  Array<{
    month: string;
    charged: number;
    collected: number;
  }>
> {
  const supabase = createClient();
  const today = getDemoToday();
  const sixMonthsAgo = getDemoDaysAgo(180);

  const { data, error } = await supabase
    .from("invoices")
    .select("date_of_service, charge_amount, insurance_paid, patient_paid")
    .eq("practice_id", practiceId)
    .gte("date_of_service", sixMonthsAgo)
    .lte("date_of_service", today);

  if (error) {
    log.error("Failed to fetch monthly billing", error, {
      action: "getMonthlyBillingTotals",
      practiceId,
    });
    return [];
  }

  // Group by month
  type MonthlyInvoice = {
    date_of_service: string | null;
    charge_amount: number;
    insurance_paid: number;
    patient_paid: number;
  };
  const monthMap = new Map<string, { charged: number; collected: number }>();

  ((data || []) as MonthlyInvoice[]).forEach((inv) => {
    if (!inv.date_of_service) return;
    const month = inv.date_of_service.substring(0, 7); // YYYY-MM
    if (!monthMap.has(month)) {
      monthMap.set(month, { charged: 0, collected: 0 });
    }
    const totals = monthMap.get(month)!;
    totals.charged += inv.charge_amount || 0;
    totals.collected += (inv.insurance_paid || 0) + (inv.patient_paid || 0);
  });

  // Convert to array and sort
  return Array.from(monthMap.entries())
    .map(([month, totals]) => ({
      month,
      ...totals,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
