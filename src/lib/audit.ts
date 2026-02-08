/**
 * Audit Logging for HIPAA Compliance
 * Real implementation that writes to the audit_logs table.
 *
 * This module provides comprehensive audit logging for:
 * - PHI access tracking
 * - User actions (view, create, update, delete)
 * - Authentication events
 * - Search and export operations
 */

import { createServiceClient } from "@/src/lib/supabase/server";

/**
 * Audit action types matching the database enum
 */
export type AuditAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "export"
  | "search"
  | "login"
  | "logout"
  | "access_denied";

/**
 * Resource types that can be audited
 */
export type AuditResourceType =
  | "patient"
  | "appointment"
  | "session_note"
  | "outcome_measure"
  | "message"
  | "invoice"
  | "priority_action"
  | "clinical_task"
  | "import_batch"
  | "user"
  | "practice"
  | "system";

/**
 * Fields that contain PHI and should be tracked
 */
export const PHI_FIELDS: Record<AuditResourceType, string[]> = {
  patient: [
    "first_name",
    "last_name",
    "date_of_birth",
    "ssn",
    "address",
    "phone",
    "email",
    "insurance_id",
  ],
  appointment: ["notes", "diagnosis_codes"],
  session_note: ["content", "diagnosis", "treatment_plan"],
  outcome_measure: ["score", "notes", "responses"],
  message: ["content", "subject"],
  invoice: ["patient_name", "diagnosis_codes"],
  priority_action: ["description", "patient_name"],
  clinical_task: ["description", "notes"],
  import_batch: [],
  user: ["email", "name"],
  practice: ["name", "address", "phone"],
  system: [],
};

/**
 * Audit log entry input
 */
export interface AuditLogEntry {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  description?: string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  phiAccessed?: boolean;
  sensitiveFields?: string[];
  userId?: string;
  userEmail?: string;
  userName?: string;
  practiceId?: string;
  practiceName?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Log an auditable action for HIPAA compliance.
 * Writes to the audit_logs table in Supabase.
 *
 * @param entry - The audit log entry to record
 * @returns Promise that resolves when the log is written
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Determine if PHI was accessed based on resource type
    const phiAccessed =
      entry.phiAccessed ??
      (entry.resourceType === "patient" ||
        entry.resourceType === "message" ||
        entry.resourceType === "session_note" ||
        entry.resourceType === "outcome_measure");

    // Get sensitive fields for this resource type
    const sensitiveFields = entry.sensitiveFields ?? PHI_FIELDS[entry.resourceType] ?? [];

    // Use metadata or details (for backwards compatibility)
    const metadataValue = entry.metadata || entry.details || {};

    // Build the audit record
    const auditRecord = {
      user_id: entry.userId || null,
      user_email: entry.userEmail || null,
      user_name: entry.userName || null,
      practice_id: entry.practiceId || null,
      practice_name: entry.practiceName || null,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId || null,
      description: entry.description || `${entry.action} ${entry.resourceType}`,
      metadata: metadataValue,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
      request_id: entry.requestId || null,
      phi_accessed: phiAccessed,
      sensitive_fields: sensitiveFields.length > 0 ? sensitiveFields : null,
    };

    // Insert into audit_logs table using the RPC function
    // This avoids type issues since audit_logs isn't in the generated types
    const { error } = await supabase.rpc("log_audit_event", {
      p_action: entry.action,
      p_resource_type: entry.resourceType,
      p_resource_id: entry.resourceId || null,
      p_description: auditRecord.description,
      p_metadata: auditRecord.metadata,
      p_phi_accessed: phiAccessed,
      p_sensitive_fields: sensitiveFields.length > 0 ? sensitiveFields : null,
    });

    if (error) {
      // Log error but don't throw - audit logging should not break the application
      console.error("[Audit] Failed to log audit event:", error.message);

      // Fallback: log to console in structured format for log aggregation
      console.log("[Audit]", JSON.stringify(auditRecord));
    }
  } catch (error) {
    // Audit logging should never break the application
    console.error("[Audit] Error:", error);

    // Fallback: log to console
    console.log(
      "[Audit]",
      JSON.stringify({
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

/**
 * Log PHI access with detailed tracking
 */
export async function logPHIAccess(
  resourceType: AuditResourceType,
  resourceId: string,
  accessedFields: string[],
  context?: {
    userId?: string;
    userEmail?: string;
    practiceId?: string;
    reason?: string;
  }
): Promise<void> {
  await logAudit({
    action: "view",
    resourceType,
    resourceId,
    description: `Accessed PHI: ${accessedFields.join(", ")}`,
    metadata: {
      accessed_fields: accessedFields,
      reason: context?.reason,
    },
    phiAccessed: true,
    sensitiveFields: accessedFields,
    userId: context?.userId,
    userEmail: context?.userEmail,
    practiceId: context?.practiceId,
  });
}

/**
 * Log search operations for compliance
 */
export async function logSearch(
  query: string,
  resultCount: number,
  context?: {
    userId?: string;
    userEmail?: string;
    practiceId?: string;
    searchType?: string;
  }
): Promise<void> {
  await logAudit({
    action: "search",
    resourceType: "system",
    description: `Search performed: "${query.substring(0, 100)}"`,
    metadata: {
      query: query.substring(0, 500), // Truncate for storage
      result_count: resultCount,
      search_type: context?.searchType,
    },
    phiAccessed: resultCount > 0, // Assume PHI accessed if results returned
    userId: context?.userId,
    userEmail: context?.userEmail,
    practiceId: context?.practiceId,
  });
}

/**
 * Log data export operations
 */
export async function logExport(
  resourceType: AuditResourceType,
  recordCount: number,
  exportFormat: string,
  context?: {
    userId?: string;
    userEmail?: string;
    practiceId?: string;
    destination?: string;
  }
): Promise<void> {
  await logAudit({
    action: "export",
    resourceType,
    description: `Exported ${recordCount} ${resourceType} records as ${exportFormat}`,
    metadata: {
      record_count: recordCount,
      export_format: exportFormat,
      destination: context?.destination,
    },
    phiAccessed: true, // Exports always involve PHI
    userId: context?.userId,
    userEmail: context?.userEmail,
    practiceId: context?.practiceId,
  });
}

/**
 * Log authentication events
 */
export async function logAuth(
  action: "login" | "logout" | "access_denied",
  userEmail: string,
  context?: {
    userId?: string;
    practiceId?: string;
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
  }
): Promise<void> {
  await logAudit({
    action,
    resourceType: "user",
    description:
      action === "access_denied"
        ? `Access denied: ${context?.reason || "unauthorized"}`
        : `User ${action}: ${userEmail}`,
    metadata: {
      reason: context?.reason,
    },
    phiAccessed: false,
    userId: context?.userId,
    userEmail,
    practiceId: context?.practiceId,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
  });
}

/**
 * Create an audit logger bound to a specific request context
 * Useful for API routes to maintain consistent context
 */
export function createRequestAuditLogger(context: {
  userId?: string;
  userEmail?: string;
  userName?: string;
  practiceId?: string;
  practiceName?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}) {
  return {
    log: (entry: Omit<AuditLogEntry, keyof typeof context>) =>
      logAudit({ ...context, ...entry }),

    logView: (resourceType: AuditResourceType, resourceId: string, description?: string) =>
      logAudit({
        ...context,
        action: "view",
        resourceType,
        resourceId,
        description,
      }),

    logCreate: (
      resourceType: AuditResourceType,
      resourceId: string,
      metadata?: Record<string, unknown>
    ) =>
      logAudit({
        ...context,
        action: "create",
        resourceType,
        resourceId,
        metadata,
      }),

    logUpdate: (
      resourceType: AuditResourceType,
      resourceId: string,
      changes?: Record<string, unknown>
    ) =>
      logAudit({
        ...context,
        action: "update",
        resourceType,
        resourceId,
        metadata: { changes },
      }),

    logDelete: (resourceType: AuditResourceType, resourceId: string) =>
      logAudit({
        ...context,
        action: "delete",
        resourceType,
        resourceId,
      }),

    logPHIAccess: (
      resourceType: AuditResourceType,
      resourceId: string,
      accessedFields: string[]
    ) =>
      logPHIAccess(resourceType, resourceId, accessedFields, {
        userId: context.userId,
        userEmail: context.userEmail,
        practiceId: context.practiceId,
      }),

    logSearch: (query: string, resultCount: number, searchType?: string) =>
      logSearch(query, resultCount, {
        userId: context.userId,
        userEmail: context.userEmail,
        practiceId: context.practiceId,
        searchType,
      }),

    logExport: (resourceType: AuditResourceType, recordCount: number, exportFormat: string) =>
      logExport(resourceType, recordCount, exportFormat, {
        userId: context.userId,
        userEmail: context.userEmail,
        practiceId: context.practiceId,
      }),
  };
}
