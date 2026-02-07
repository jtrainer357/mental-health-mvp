/**
 * Query Functions Index
 * Re-exports all database queries and React Query hooks for easy imports
 */

// Query Provider
export { QueryProvider } from "./query-provider";

// Query Keys
export {
  queryKeys,
  patientKeys,
  appointmentKeys,
  priorityActionKeys,
  billingKeys,
  communicationKeys,
  practiceKeys,
  outcomeKeys,
  reviewKeys,
} from "./keys";

// Priority Actions
export {
  getPriorityActions,
  getPatientPriorityActions,
  completeAction,
  dismissAction,
  completeAllPatientActions,
  getActionCounts,
} from "./priority-actions";

// Patients
export {
  getPatients,
  getPatientById,
  getPatientByExternalId,
  getPatientAppointments,
  getPatientOutcomeMeasures,
  getPatientMessages,
  getPatientInvoices, // From patients.ts - basic invoice fetch
  getPatientDetails,
  searchPatients,
  getHighRiskPatients,
} from "./patients";

// Patient React Query Hooks
export {
  usePatients,
  usePatient,
  usePatientDetails,
  usePatientAppointments,
  usePatientOutcomeMeasures,
  usePatientMessages,
  usePatientInvoices,
  usePatientVisitSummaries,
  usePatientPriorityActions,
  usePatientSearch,
  useHighRiskPatients,
  useCompleteAllPatientActions,
} from "./use-patients";

// Appointments
export {
  getTodayAppointments,
  getUpcomingAppointments,
  getRecentAppointments,
  getAppointmentStats,
  updateAppointmentStatus,
} from "./appointments";
export type { AppointmentWithPatient } from "./appointments";

// Appointment React Query Hooks
export {
  useTodayAppointments,
  useUpcomingAppointments,
  useRecentAppointments,
  useAppointmentStats,
  useUpdateAppointmentStatus,
} from "./use-appointments";

// Communications
export {
  getCommunications,
  getPatientCommunications,
  getCommunicationThreads,
  getUnreadCount,
  markAsRead,
} from "./communications";
export type { Communication, CommunicationWithPatient } from "./communications";

// Communication React Query Hooks
export {
  useCommunications,
  usePatientCommunications,
  useCommunicationThreads,
  useUnreadCount,
  useMarkAsRead,
} from "./use-communications";

// Billing/Invoices
export {
  getInvoices,
  getInvoicesByDateRange,
  getBillingSummary,
  getPatientInvoices as getBillingPatientInvoices, // Renamed to avoid conflict with patients.ts
  getOutstandingInvoices,
  getMonthlyBillingTotals,
} from "./billing";
export type { Invoice, InvoiceWithPatient, BillingSummary } from "./billing";

// Invoice React Query Hooks
export {
  useInvoices,
  useInvoicesByDateRange,
  useBillingSummary,
  usePatientInvoices as useBillingPatientInvoices, // Renamed to avoid conflict
  useOutstandingInvoices,
  useMonthlyBillingTotals,
} from "./use-invoices";

// Practice
export {
  getDemoPractice,
  getPracticeId,
  getDashboardStats,
  isDatabasePopulated,
  getRecentAnalysisRuns,
} from "./practice";

// Practice React Query Hooks
export {
  useDemoPractice,
  useDashboardStats,
  useIsDatabasePopulated,
  useRecentAnalysisRuns,
} from "./use-practice";

// Priority Action React Query Hooks
export {
  usePriorityActions,
  usePatientPriorityActionsQuery,
  useActionCounts,
} from "./use-priority-actions";
