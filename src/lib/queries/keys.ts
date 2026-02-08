/**
 * Query Keys Factory
 * Centralized query key management for React Query / data fetching
 * Provides consistent, hierarchical keys for caching and invalidation
 */

/**
 * Patient query keys
 */
export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (practiceId: string) => [...patientKeys.lists(), practiceId] as const,
  details: () => [...patientKeys.all, "detail"] as const,
  detail: (patientId: string) => [...patientKeys.details(), patientId] as const,
  search: (query: string, practiceId: string) =>
    [...patientKeys.all, "search", practiceId, query] as const,
  highRisk: (practiceId: string) => [...patientKeys.all, "high-risk", practiceId] as const,
  // Patient-specific data
  appointments: (patientId: string) => [...patientKeys.detail(patientId), "appointments"] as const,
  outcomeMeasures: (patientId: string) =>
    [...patientKeys.detail(patientId), "outcomeMeasures"] as const,
  messages: (patientId: string) => [...patientKeys.detail(patientId), "messages"] as const,
  invoices: (patientId: string) => [...patientKeys.detail(patientId), "invoices"] as const,
  visitSummaries: (patientId: string) =>
    [...patientKeys.detail(patientId), "visitSummaries"] as const,
  priorityActions: (patientId: string) =>
    [...patientKeys.detail(patientId), "priorityActions"] as const,
  reviews: (patientId: string) => [...patientKeys.detail(patientId), "reviews"] as const,
};

/**
 * Appointment query keys
 */
export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: (filters: { startDate?: string; endDate?: string; patientId?: string; status?: string }) =>
    [...appointmentKeys.lists(), filters] as const,
  byDate: (date: string) => [...appointmentKeys.lists(), "date", date] as const,
  byPatient: (patientId: string) => [...appointmentKeys.lists(), "patient", patientId] as const,
  today: (practiceId: string) => [...appointmentKeys.all, "today", practiceId] as const,
  upcoming: (practiceId: string, days: number) =>
    [...appointmentKeys.all, "upcoming", practiceId, days] as const,
  recent: (practiceId: string, days: number) =>
    [...appointmentKeys.all, "recent", practiceId, days] as const,
  stats: (practiceId: string) => [...appointmentKeys.all, "stats", practiceId] as const,
};

/**
 * Priority action query keys
 */
export const priorityActionKeys = {
  all: ["priority-actions"] as const,
  lists: () => [...priorityActionKeys.all, "list"] as const,
  list: (practiceId: string) => [...priorityActionKeys.lists(), practiceId] as const,
  byPatient: (patientId: string) => [...priorityActionKeys.all, "patient", patientId] as const,
  counts: (practiceId: string) => [...priorityActionKeys.all, "counts", practiceId] as const,
};

/**
 * Billing query keys
 */
export const billingKeys = {
  all: ["billing"] as const,
  invoices: () => [...billingKeys.all, "invoices"] as const,
  invoiceList: (practiceId: string) => [...billingKeys.invoices(), practiceId] as const,
  invoicesByPatient: (patientId: string) =>
    [...billingKeys.invoices(), "patient", patientId] as const,
  outstanding: (practiceId: string) => [...billingKeys.all, "outstanding", practiceId] as const,
  summary: (practiceId: string) => [...billingKeys.all, "summary", practiceId] as const,
  monthlyTotals: (practiceId: string) => [...billingKeys.all, "monthlyTotals", practiceId] as const,
  byDateRange: (practiceId: string, startDate: string, endDate: string) =>
    [...billingKeys.invoices(), "dateRange", practiceId, startDate, endDate] as const,
};

/**
 * Communication query keys
 */
export const communicationKeys = {
  all: ["communications"] as const,
  lists: () => [...communicationKeys.all, "list"] as const,
  list: (practiceId: string) => [...communicationKeys.lists(), practiceId] as const,
  byPatient: (patientId: string) => [...communicationKeys.all, "patient", patientId] as const,
  threads: (practiceId: string) => [...communicationKeys.all, "threads", practiceId] as const,
  unreadCount: (practiceId: string) => [...communicationKeys.all, "unread", practiceId] as const,
};

/**
 * Practice query keys
 */
export const practiceKeys = {
  all: ["practice"] as const,
  demo: () => [...practiceKeys.all, "demo"] as const,
  detail: (practiceId: string) => [...practiceKeys.all, practiceId] as const,
  dashboardStats: (practiceId: string) =>
    [...practiceKeys.all, "dashboardStats", practiceId] as const,
  isPopulated: (practiceId: string) => [...practiceKeys.all, "isPopulated", practiceId] as const,
  analysisRuns: (practiceId: string) => [...practiceKeys.all, "analysisRuns", practiceId] as const,
};

/**
 * Outcome measure query keys
 */
export const outcomeKeys = {
  all: ["outcomes"] as const,
  byPatient: (patientId: string) => [...outcomeKeys.all, "patient", patientId] as const,
  trends: (patientId: string) => [...outcomeKeys.all, "trends", patientId] as const,
};

/**
 * Review query keys
 */
export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  list: (practiceId: string) => [...reviewKeys.lists(), practiceId] as const,
  byPatient: (patientId: string) => [...reviewKeys.all, "patient", patientId] as const,
  byType: (practiceId: string, reviewType: string) =>
    [...reviewKeys.all, "type", practiceId, reviewType] as const,
  averageRating: (practiceId: string) => [...reviewKeys.all, "averageRating", practiceId] as const,
  recent: (practiceId: string, limit: number) =>
    [...reviewKeys.all, "recent", practiceId, limit] as const,
};

// Combined query keys for convenience
export const queryKeys = {
  patients: patientKeys,
  appointments: appointmentKeys,
  priorityActions: priorityActionKeys,
  billing: billingKeys,
  communications: communicationKeys,
  practice: practiceKeys,
  outcomes: outcomeKeys,
  reviews: reviewKeys,
} as const;
