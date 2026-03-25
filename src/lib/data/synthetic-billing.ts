/**
 * Synthetic Billing Data for Billing Page
 */

import { SYNTHETIC_PATIENTS } from "./synthetic-patients";
import { SYNTHETIC_APPOINTMENTS } from "./synthetic-appointments";

export interface Invoice {
  id: string;
  patient_id: string;
  patient_name: string;
  appointment_id: string;
  date_of_service: string;
  cpt_code: string;
  charge_amount: number;
  insurance_paid: number;
  patient_responsibility: number;
  patient_paid: number;
  balance: number;
  status: "Paid" | "Pending" | "Partial" | "Denied";
}

export interface BillingSummary {
  total_outstanding: number;
  collections_this_month: number;
  aging_0_30: number;
  aging_31_60: number;
  aging_61_90: number;
  aging_90_plus: number;
  claim_denial_rate: number;
}

// Patient name lookup - derive from single source of truth
const patientNameMap = new Map<string, string>();
SYNTHETIC_PATIENTS.forEach((p) => {
  patientNameMap.set(p.id, `${p.first_name} ${p.last_name}`);
});

/**
 * Get patient full name from patient_id (external_id)
 * This ensures all invoices use consistent names from patient data
 */
function getPatientName(patientId: string): string {
  return patientNameMap.get(patientId) || "Unknown Patient";
}

// Seeded random for consistency
let seed = 11111;
function seededRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function generateBillingData() {
  const invoices: Invoice[] = [];
  let invoiceId = 1;

  // Create invoices for completed appointments
  const completedAppts = SYNTHETIC_APPOINTMENTS.filter((a) => a.status === "Completed");

  completedAppts.forEach((appt) => {
    const patient = SYNTHETIC_PATIENTS.find((p) => p.id === appt.patient_id);
    if (!patient) return;

    const chargeAmount = appt.cpt_code === "90837" ? 180 : appt.cpt_code === "90834" ? 150 : 200;
    const isSelfPay = patient.insurance_provider === "Self-Pay";

    let insurancePaid = 0;
    let patientResponsibility = chargeAmount;
    let patientPaid = 0;
    let status: Invoice["status"] = "Pending";

    if (!isSelfPay) {
      // Insurance patients
      const denialRoll = seededRandom();
      if (denialRoll < 0.08) {
        // Denied claim
        status = "Denied";
        patientResponsibility = chargeAmount;
      } else {
        // Covered
        insurancePaid = Math.round(chargeAmount * (0.6 + seededRandom() * 0.3)); // 60-90% covered
        patientResponsibility = chargeAmount - insurancePaid;

        // Did patient pay their copay?
        const daysSinceService = Math.floor(
          (Date.now() - new Date(appt.date).getTime()) / 86400000
        );
        if (daysSinceService > 14 && seededRandom() > 0.3) {
          patientPaid = patientResponsibility;
          status = "Paid";
        } else if (daysSinceService > 7 && seededRandom() > 0.5) {
          patientPaid = Math.round(patientResponsibility * 0.5);
          status = "Partial";
        }
      }
    } else {
      // Self-pay patients
      const daysSinceService = Math.floor((Date.now() - new Date(appt.date).getTime()) / 86400000);
      if (daysSinceService > 7 && seededRandom() > 0.4) {
        patientPaid = chargeAmount;
        status = "Paid";
      } else if (seededRandom() > 0.6) {
        patientPaid = Math.round(chargeAmount * 0.5);
        status = "Partial";
      }
    }

    invoices.push({
      id: `inv-${String(invoiceId++).padStart(5, "0")}`,
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      appointment_id: appt.id,
      date_of_service: appt.date,
      cpt_code: appt.cpt_code,
      charge_amount: chargeAmount,
      insurance_paid: insurancePaid,
      patient_responsibility: patientResponsibility,
      patient_paid: patientPaid,
      balance: patientResponsibility - patientPaid,
      status,
    });
  });

  // Calculate summary
  const unpaidInvoices = invoices.filter((i) => i.balance > 0);
  const paidThisMonth = invoices.filter((i) => {
    const serviceDate = new Date(i.date_of_service);
    const now = new Date();
    return serviceDate.getMonth() === now.getMonth() && i.status === "Paid";
  });

  const now = new Date();
  const summary: BillingSummary = {
    total_outstanding: unpaidInvoices.reduce((sum, i) => sum + i.balance, 0),
    collections_this_month: paidThisMonth.reduce(
      (sum, i) => sum + i.patient_paid + i.insurance_paid,
      0
    ),
    aging_0_30: unpaidInvoices
      .filter((i) => (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000 <= 30)
      .reduce((sum, i) => sum + i.balance, 0),
    aging_31_60: unpaidInvoices
      .filter((i) => {
        const days = (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000;
        return days > 30 && days <= 60;
      })
      .reduce((sum, i) => sum + i.balance, 0),
    aging_61_90: unpaidInvoices
      .filter((i) => {
        const days = (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000;
        return days > 60 && days <= 90;
      })
      .reduce((sum, i) => sum + i.balance, 0),
    aging_90_plus: unpaidInvoices
      .filter((i) => (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000 > 90)
      .reduce((sum, i) => sum + i.balance, 0),
    claim_denial_rate: invoices.filter((i) => i.status === "Denied").length / invoices.length,
  };

  return { invoices, summary };
}

const { invoices: generatedInvoices, summary: generatedSummary } = generateBillingData();

// ============================================================================
// COMPREHENSIVE DEMO PATIENT INVOICES
// Realistic billing scenarios for Patient 360 Billing tab
// ============================================================================

const DEMO_INVOICES: Invoice[] = [
  // RACHEL TORRES - 6 invoices (all paid, good payer)
  {
    id: "inv-demo-rachel-001",
    patient_id: "rachel-torres-demo",
    patient_name: getPatientName("rachel-torres-demo"),
    appointment_id: "apt-demo-rachel-001",
    date_of_service: "2025-06-22",
    cpt_code: "90791",
    charge_amount: 200,
    insurance_paid: 160,
    patient_responsibility: 40,
    patient_paid: 40,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-rachel-002",
    patient_id: "rachel-torres-demo",
    patient_name: getPatientName("rachel-torres-demo"),
    appointment_id: "apt-demo-rachel-002",
    date_of_service: "2025-07-20",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-rachel-003",
    patient_id: "rachel-torres-demo",
    patient_name: getPatientName("rachel-torres-demo"),
    appointment_id: "apt-demo-rachel-003",
    date_of_service: "2025-09-14",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-rachel-004",
    patient_id: "rachel-torres-demo",
    patient_name: getPatientName("rachel-torres-demo"),
    appointment_id: "apt-demo-rachel-004",
    date_of_service: "2025-10-26",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-rachel-005",
    patient_id: "rachel-torres-demo",
    patient_name: getPatientName("rachel-torres-demo"),
    appointment_id: "apt-demo-rachel-005",
    date_of_service: "2025-12-07",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-rachel-006",
    patient_id: "rachel-torres-demo",
    patient_name: getPatientName("rachel-torres-demo"),
    appointment_id: "apt-demo-rachel-006",
    date_of_service: "2026-01-26",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },

  // JAMES OKAFOR - 5 invoices (Tricare covers 100%)
  {
    id: "inv-demo-james-001",
    patient_id: "james-okafor-demo",
    patient_name: getPatientName("james-okafor-demo"),
    appointment_id: "apt-demo-james-001",
    date_of_service: "2025-04-17",
    cpt_code: "90791",
    charge_amount: 200,
    insurance_paid: 200,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-james-002",
    patient_id: "james-okafor-demo",
    patient_name: getPatientName("james-okafor-demo"),
    appointment_id: "apt-demo-james-002",
    date_of_service: "2025-06-12",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 175,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-james-003",
    patient_id: "james-okafor-demo",
    patient_name: getPatientName("james-okafor-demo"),
    appointment_id: "apt-demo-james-003",
    date_of_service: "2025-08-07",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 175,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },
  // No invoice for no-show (2025-09-15)
  {
    id: "inv-demo-james-004",
    patient_id: "james-okafor-demo",
    patient_name: getPatientName("james-okafor-demo"),
    appointment_id: "apt-demo-james-005",
    date_of_service: "2025-11-20",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 175,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-james-005",
    patient_id: "james-okafor-demo",
    patient_name: getPatientName("james-okafor-demo"),
    appointment_id: "apt-demo-james-006",
    date_of_service: "2026-01-26",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 175,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },

  // SOPHIA CHEN-MARTINEZ - 5 invoices (one copay outstanding - $50)
  {
    id: "inv-demo-sophia-001",
    patient_id: "sophia-chen-martinez-demo",
    patient_name: getPatientName("sophia-chen-martinez-demo"),
    appointment_id: "apt-demo-sophia-001",
    date_of_service: "2025-09-08",
    cpt_code: "90791",
    charge_amount: 200,
    insurance_paid: 160,
    patient_responsibility: 40,
    patient_paid: 40,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-sophia-002",
    patient_id: "sophia-chen-martinez-demo",
    patient_name: getPatientName("sophia-chen-martinez-demo"),
    appointment_id: "apt-demo-sophia-002",
    date_of_service: "2025-10-06",
    cpt_code: "90834",
    charge_amount: 150,
    insurance_paid: 120,
    patient_responsibility: 30,
    patient_paid: 30,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-sophia-003",
    patient_id: "sophia-chen-martinez-demo",
    patient_name: getPatientName("sophia-chen-martinez-demo"),
    appointment_id: "apt-demo-sophia-003",
    date_of_service: "2025-11-03",
    cpt_code: "90834",
    charge_amount: 150,
    insurance_paid: 120,
    patient_responsibility: 30,
    patient_paid: 30,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-sophia-004",
    patient_id: "sophia-chen-martinez-demo",
    patient_name: getPatientName("sophia-chen-martinez-demo"),
    appointment_id: "apt-demo-sophia-004",
    date_of_service: "2025-12-01",
    cpt_code: "90834",
    charge_amount: 150,
    insurance_paid: 120,
    patient_responsibility: 30,
    patient_paid: 30,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-sophia-005",
    patient_id: "sophia-chen-martinez-demo",
    patient_name: getPatientName("sophia-chen-martinez-demo"),
    appointment_id: "apt-demo-sophia-005",
    date_of_service: "2026-01-12",
    cpt_code: "90834",
    charge_amount: 150,
    insurance_paid: 100,
    patient_responsibility: 50,
    patient_paid: 0,
    balance: 50,
    status: "Pending", // Outstanding copay
  },

  // MARCUS WASHINGTON - 8 invoices (insurance pays, copays current)
  {
    id: "inv-demo-marcus-001",
    patient_id: "marcus-washington-demo",
    patient_name: getPatientName("marcus-washington-demo"),
    appointment_id: "apt-demo-marcus-001",
    date_of_service: "2024-12-02",
    cpt_code: "90791",
    charge_amount: 200,
    insurance_paid: 160,
    patient_responsibility: 40,
    patient_paid: 40,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-marcus-002",
    patient_id: "marcus-washington-demo",
    patient_name: getPatientName("marcus-washington-demo"),
    appointment_id: "apt-demo-marcus-002",
    date_of_service: "2025-01-06",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-marcus-003",
    patient_id: "marcus-washington-demo",
    patient_name: getPatientName("marcus-washington-demo"),
    appointment_id: "apt-demo-marcus-003",
    date_of_service: "2025-02-03",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-marcus-004",
    patient_id: "marcus-washington-demo",
    patient_name: getPatientName("marcus-washington-demo"),
    appointment_id: "apt-demo-marcus-004",
    date_of_service: "2025-03-03",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-marcus-005",
    patient_id: "marcus-washington-demo",
    patient_name: getPatientName("marcus-washington-demo"),
    appointment_id: "apt-demo-marcus-005",
    date_of_service: "2025-05-05",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-marcus-006",
    patient_id: "marcus-washington-demo",
    patient_name: getPatientName("marcus-washington-demo"),
    appointment_id: "apt-demo-marcus-006",
    date_of_service: "2025-07-07",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-marcus-007",
    patient_id: "marcus-washington-demo",
    patient_name: getPatientName("marcus-washington-demo"),
    appointment_id: "apt-demo-marcus-007",
    date_of_service: "2025-09-08",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-marcus-008",
    patient_id: "marcus-washington-demo",
    patient_name: getPatientName("marcus-washington-demo"),
    appointment_id: "apt-demo-marcus-008",
    date_of_service: "2026-01-12",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },

  // EMMA KOWALSKI - 4 invoices (two recent copays pending - $75)
  {
    id: "inv-demo-emma-001",
    patient_id: "emma-kowalski-demo",
    patient_name: getPatientName("emma-kowalski-demo"),
    appointment_id: "apt-demo-emma-001",
    date_of_service: "2025-04-01",
    cpt_code: "90791",
    charge_amount: 200,
    insurance_paid: 160,
    patient_responsibility: 40,
    patient_paid: 40,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-emma-002",
    patient_id: "emma-kowalski-demo",
    patient_name: getPatientName("emma-kowalski-demo"),
    appointment_id: "apt-demo-emma-002",
    date_of_service: "2025-06-15",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-emma-003",
    patient_id: "emma-kowalski-demo",
    patient_name: getPatientName("emma-kowalski-demo"),
    appointment_id: "apt-demo-emma-003",
    date_of_service: "2025-09-22",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 0,
    balance: 35,
    status: "Pending", // Outstanding
  },
  {
    id: "inv-demo-emma-004",
    patient_id: "emma-kowalski-demo",
    patient_name: getPatientName("emma-kowalski-demo"),
    appointment_id: "apt-demo-emma-004",
    date_of_service: "2026-01-29",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 135,
    patient_responsibility: 40,
    patient_paid: 0,
    balance: 40,
    status: "Pending", // Outstanding
  },

  // DAVID NAKAMURA - 4 invoices (pays at time of service)
  {
    id: "inv-demo-david-001",
    patient_id: "david-nakamura-demo",
    patient_name: getPatientName("david-nakamura-demo"),
    appointment_id: "apt-demo-david-001",
    date_of_service: "2025-10-08",
    cpt_code: "90791",
    charge_amount: 200,
    insurance_paid: 160,
    patient_responsibility: 40,
    patient_paid: 40,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-david-002",
    patient_id: "david-nakamura-demo",
    patient_name: getPatientName("david-nakamura-demo"),
    appointment_id: "apt-demo-david-002",
    date_of_service: "2025-11-05",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-david-003",
    patient_id: "david-nakamura-demo",
    patient_name: getPatientName("david-nakamura-demo"),
    appointment_id: "apt-demo-david-003",
    date_of_service: "2025-12-03",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-david-004",
    patient_id: "david-nakamura-demo",
    patient_name: getPatientName("david-nakamura-demo"),
    appointment_id: "apt-demo-david-004",
    date_of_service: "2026-01-28",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 140,
    patient_responsibility: 35,
    patient_paid: 35,
    balance: 0,
    status: "Paid",
  },

  // AALIYAH BROOKS - 4 invoices (one copay outstanding - $30)
  // Note: one appointment was cancelled, no invoice for that
  {
    id: "inv-demo-aaliyah-001",
    patient_id: "aaliyah-brooks-demo",
    patient_name: getPatientName("aaliyah-brooks-demo"),
    appointment_id: "apt-demo-aaliyah-001",
    date_of_service: "2025-08-20",
    cpt_code: "90791",
    charge_amount: 200,
    insurance_paid: 160,
    patient_responsibility: 40,
    patient_paid: 40,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-aaliyah-002",
    patient_id: "aaliyah-brooks-demo",
    patient_name: getPatientName("aaliyah-brooks-demo"),
    appointment_id: "apt-demo-aaliyah-002",
    date_of_service: "2025-09-17",
    cpt_code: "90834",
    charge_amount: 150,
    insurance_paid: 120,
    patient_responsibility: 30,
    patient_paid: 30,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-aaliyah-003",
    patient_id: "aaliyah-brooks-demo",
    patient_name: getPatientName("aaliyah-brooks-demo"),
    appointment_id: "apt-demo-aaliyah-003",
    date_of_service: "2025-10-15",
    cpt_code: "90834",
    charge_amount: 150,
    insurance_paid: 120,
    patient_responsibility: 30,
    patient_paid: 30,
    balance: 0,
    status: "Paid",
  },
  // Cancelled appointment (2025-11-05) - no invoice
  {
    id: "inv-demo-aaliyah-004",
    patient_id: "aaliyah-brooks-demo",
    patient_name: getPatientName("aaliyah-brooks-demo"),
    appointment_id: "apt-demo-aaliyah-005",
    date_of_service: "2026-01-28",
    cpt_code: "90834",
    charge_amount: 150,
    insurance_paid: 120,
    patient_responsibility: 30,
    patient_paid: 0,
    balance: 30,
    status: "Pending", // Outstanding
  },

  // ROBERT FITZGERALD - 5 invoices (Medicare, no patient cost)
  {
    id: "inv-demo-robert-001",
    patient_id: "robert-fitzgerald-demo",
    patient_name: getPatientName("robert-fitzgerald-demo"),
    appointment_id: "apt-demo-robert-001",
    date_of_service: "2025-07-10",
    cpt_code: "90791",
    charge_amount: 200,
    insurance_paid: 200,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-robert-002",
    patient_id: "robert-fitzgerald-demo",
    patient_name: getPatientName("robert-fitzgerald-demo"),
    appointment_id: "apt-demo-robert-002",
    date_of_service: "2025-08-21",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 175,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-robert-003",
    patient_id: "robert-fitzgerald-demo",
    patient_name: getPatientName("robert-fitzgerald-demo"),
    appointment_id: "apt-demo-robert-003",
    date_of_service: "2025-10-02",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 175,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-robert-004",
    patient_id: "robert-fitzgerald-demo",
    patient_name: getPatientName("robert-fitzgerald-demo"),
    appointment_id: "apt-demo-robert-004",
    date_of_service: "2025-11-13",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 175,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-robert-005",
    patient_id: "robert-fitzgerald-demo",
    patient_name: getPatientName("robert-fitzgerald-demo"),
    appointment_id: "apt-demo-robert-005",
    date_of_service: "2026-01-30",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 175,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },

  // CARMEN ALVAREZ - 4 invoices (Medicaid, no patient cost)
  {
    id: "inv-demo-carmen-001",
    patient_id: "carmen-alvarez-demo",
    patient_name: getPatientName("carmen-alvarez-demo"),
    appointment_id: "apt-demo-carmen-001",
    date_of_service: "2025-11-10",
    cpt_code: "90791",
    charge_amount: 200,
    insurance_paid: 200,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-carmen-002",
    patient_id: "carmen-alvarez-demo",
    patient_name: getPatientName("carmen-alvarez-demo"),
    appointment_id: "apt-demo-carmen-002",
    date_of_service: "2025-11-24",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 175,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-carmen-003",
    patient_id: "carmen-alvarez-demo",
    patient_name: getPatientName("carmen-alvarez-demo"),
    appointment_id: "apt-demo-carmen-003",
    date_of_service: "2025-12-15",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 175,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-demo-carmen-004",
    patient_id: "carmen-alvarez-demo",
    patient_name: getPatientName("carmen-alvarez-demo"),
    appointment_id: "apt-demo-carmen-004",
    date_of_service: "2026-02-07",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 175,
    patient_responsibility: 0,
    patient_paid: 0,
    balance: 0,
    status: "Paid",
  },

  // TYLER HARRISON - No invoices (new patient, no billing yet)

  // ============================================================================
  // WEEK 1 TESTING ADDITIONS — Invoices for 3 new patients
  // ============================================================================

  // LISA WHITFIELD — 4 invoices, all paid
  {
    id: "inv-lisa-001",
    patient_id: "lisa-whitfield-demo",
    patient_name: getPatientName("lisa-whitfield-demo"),
    appointment_id: "apt-demo-lisa-002",
    date_of_service: "2025-06-01",
    cpt_code: "90791",
    charge_amount: 250,
    insurance_paid: 180,
    patient_responsibility: 70,
    patient_paid: 70,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-lisa-002",
    patient_id: "lisa-whitfield-demo",
    patient_name: getPatientName("lisa-whitfield-demo"),
    appointment_id: "apt-demo-lisa-003",
    date_of_service: "2025-08-15",
    cpt_code: "90837",
    charge_amount: 200,
    insurance_paid: 145,
    patient_responsibility: 55,
    patient_paid: 55,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-lisa-003",
    patient_id: "lisa-whitfield-demo",
    patient_name: getPatientName("lisa-whitfield-demo"),
    appointment_id: "apt-demo-lisa-004",
    date_of_service: "2025-11-01",
    cpt_code: "90837",
    charge_amount: 200,
    insurance_paid: 145,
    patient_responsibility: 55,
    patient_paid: 55,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-lisa-004",
    patient_id: "lisa-whitfield-demo",
    patient_name: getPatientName("lisa-whitfield-demo"),
    appointment_id: "apt-demo-lisa-005",
    date_of_service: "2026-01-26",
    cpt_code: "90837",
    charge_amount: 200,
    insurance_paid: 145,
    patient_responsibility: 55,
    patient_paid: 55,
    balance: 0,
    status: "Paid",
  },

  // KEVIN RHODES — 4 invoices, 1 unpaid ($45 balance)
  {
    id: "inv-kevin-001",
    patient_id: "kevin-rhodes-demo",
    patient_name: getPatientName("kevin-rhodes-demo"),
    appointment_id: "apt-demo-kevin-002",
    date_of_service: "2024-10-01",
    cpt_code: "90791",
    charge_amount: 250,
    insurance_paid: 185,
    patient_responsibility: 65,
    patient_paid: 65,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-kevin-002",
    patient_id: "kevin-rhodes-demo",
    patient_name: getPatientName("kevin-rhodes-demo"),
    appointment_id: "apt-demo-kevin-003",
    date_of_service: "2024-11-15",
    cpt_code: "90837",
    charge_amount: 200,
    insurance_paid: 145,
    patient_responsibility: 55,
    patient_paid: 55,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-kevin-003",
    patient_id: "kevin-rhodes-demo",
    patient_name: getPatientName("kevin-rhodes-demo"),
    appointment_id: "apt-demo-kevin-005",
    date_of_service: "2025-08-20",
    cpt_code: "90837",
    charge_amount: 200,
    insurance_paid: 145,
    patient_responsibility: 55,
    patient_paid: 55,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-kevin-004",
    patient_id: "kevin-rhodes-demo",
    patient_name: getPatientName("kevin-rhodes-demo"),
    appointment_id: "apt-demo-kevin-006",
    date_of_service: "2026-01-28",
    cpt_code: "90837",
    charge_amount: 200,
    insurance_paid: 145,
    patient_responsibility: 55,
    patient_paid: 10,
    balance: 45,
    status: "Partial",
  },

  // PRIYA SHARMA — 4 invoices, 2 unpaid ($175 total outstanding — SELF-PAY)
  {
    id: "inv-priya-001",
    patient_id: "priya-sharma-demo",
    patient_name: getPatientName("priya-sharma-demo"),
    appointment_id: "apt-demo-priya-002",
    date_of_service: "2025-08-01",
    cpt_code: "90791",
    charge_amount: 200,
    insurance_paid: 0,
    patient_responsibility: 200,
    patient_paid: 200,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-priya-002",
    patient_id: "priya-sharma-demo",
    patient_name: getPatientName("priya-sharma-demo"),
    appointment_id: "apt-demo-priya-003",
    date_of_service: "2025-10-15",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 0,
    patient_responsibility: 175,
    patient_paid: 175,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-priya-003",
    patient_id: "priya-sharma-demo",
    patient_name: getPatientName("priya-sharma-demo"),
    appointment_id: "apt-demo-priya-004",
    date_of_service: "2025-12-10",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 0,
    patient_responsibility: 175,
    patient_paid: 100,
    balance: 75,
    status: "Partial",
  },
  {
    id: "inv-priya-004",
    patient_id: "priya-sharma-demo",
    patient_name: getPatientName("priya-sharma-demo"),
    appointment_id: "apt-demo-priya-005",
    date_of_service: "2026-01-30",
    cpt_code: "90837",
    charge_amount: 175,
    insurance_paid: 0,
    patient_responsibility: 175,
    patient_paid: 75,
    balance: 100,
    status: "Partial",
  },
];

// Combine generated and demo invoices
const allInvoices = [...generatedInvoices, ...DEMO_INVOICES];

// Recalculate summary with demo invoices
const unpaidInvoices = allInvoices.filter((i) => i.balance > 0);
const paidThisMonth = allInvoices.filter((i) => {
  const serviceDate = new Date(i.date_of_service);
  const now = new Date();
  return serviceDate.getMonth() === now.getMonth() && i.status === "Paid";
});

const now = new Date();
const combinedSummary: BillingSummary = {
  total_outstanding: unpaidInvoices.reduce((sum, i) => sum + i.balance, 0),
  collections_this_month: paidThisMonth.reduce(
    (sum, i) => sum + i.patient_paid + i.insurance_paid,
    0
  ),
  aging_0_30: unpaidInvoices
    .filter((i) => (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000 <= 30)
    .reduce((sum, i) => sum + i.balance, 0),
  aging_31_60: unpaidInvoices
    .filter((i) => {
      const days = (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000;
      return days > 30 && days <= 60;
    })
    .reduce((sum, i) => sum + i.balance, 0),
  aging_61_90: unpaidInvoices
    .filter((i) => {
      const days = (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000;
      return days > 60 && days <= 90;
    })
    .reduce((sum, i) => sum + i.balance, 0),
  aging_90_plus: unpaidInvoices
    .filter((i) => (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000 > 90)
    .reduce((sum, i) => sum + i.balance, 0),
  claim_denial_rate: allInvoices.filter((i) => i.status === "Denied").length / allInvoices.length,
};

export const SYNTHETIC_INVOICES = allInvoices;
export const BILLING_SUMMARY = combinedSummary;
