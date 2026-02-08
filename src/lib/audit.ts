/**
 * Audit logging for HIPAA compliance.
 * Captures who accessed what PHI and when.
 */

import { createServiceClient } from "@/src/lib/supabase/server";
import { createLogger } from "@/src/lib/logger";
import { getSession } from "@/src/lib/auth/session";

// Create a logger instance for audit
const logger = createLogger("audit");

/**
 * Audit action types
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
 * Audit resource types - must match database enum
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
 * PHI field categories for sensitive data tracking
 */
export const PHI_FIELDS: Record<AuditResourceType, string[]> = {
  patient: [
    "first_name",
    "last_name",
    "date_of_birth",
    "email",
    "phone",
    "address",
    "ssn",
    "insurance",
  ],
  appointment: ["patient_id", "notes"],
  session_note: ["content", "diagnosis", "treatment_plan"],
  outcome_measure: ["score", "notes", "responses"],
  message: ["content", "recipient"],
  invoice: ["patient_id", "charges"],
  priority_action: ["clinical_context", "patient_id"],
  clinical_task: ["description", "patient_id"],
  import_batch: ["file_name", "records"],
  user: ["email", "name"],
  practice: ["name", "settings"],
  system: [],
};

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  phiAccessed?: boolean;
  sensitiveFields?: string[];
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Context for audit logging
 */
interface AuditContext {
  userId?: string;
  userEmail?: string;
  userName?: string;
  practiceId?: string;
  practiceName?: string;
}

/**
 * Get audit context from current session
 */
async function getAuditContext(): Promise<AuditContext> {
  try {
    const session = await getSession();
    if (session?.user) {
      return {
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
        practiceId: session.practiceId,
        practiceName: session.user.practiceName,
      };
    }
  } catch {
    // Session might not be available in some contexts
  }
  return {};
}

/**
 * Determine if PHI was accessed based on resource type
 */
function isPHIResource(resourceType: AuditResourceType): boolean {
  const phiResources: AuditResourceType[] = [
    "patient",
    "appointment",
    "session_note",
    "outcome_measure",
    "message",
    "clinical_task",
    "priority_action",
  ];
  return phiResources.includes(resourceType);
}

/**
 * Log an auditable action for HIPAA compliance.
 * Writes to the audit_logs table in Supabase.
 *
 * @param entry - The audit log entry to record
 * @returns The ID of the created audit log entry, or null if logging failed
 */
export async function logAudit(entry: AuditLogEntry): Promise<string | null> {
  try {
    const context = await getAuditContext();
    const supabase = createServiceClient();

    // Determine PHI access
    const phiAccessed = entry.phiAccessed ?? isPHIResource(entry.resourceType);
    const sensitiveFields =
      entry.sensitiveFields ?? PHI_FIELDS[entry.resourceType] ?? [];

    // Build the audit log record
    const auditRecord = {
      user_id: context.userId ?? null,
      user_email: context.userEmail ?? null,
      user_name: context.userName ?? null,
      practice_id: context.practiceId ?? null,
      practice_name: context.practiceName ?? null,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      description: entry.description ?? null,
      metadata: entry.metadata ?? {},
      ip_address: entry.ipAddress ?? null,
      user_agent: entry.userAgent ?? null,
      request_id: entry.requestId ?? null,
      phi_accessed: phiAccessed,
      sensitive_fields: sensitiveFields.length > 0 ? sensitiveFields : null,
    };

    // Insert audit log
    const { data, error } = await supabase
      .from("audit_logs")
      .insert(auditRecord)
      .select("id")
      .single();

    if (error) {
      // Log error but don't throw - audit logging should not break the app
      logger.error("Failed to write audit log", {
        error: error.message,
        code: error.code,
        entry: {
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
        },
      });
      return null;
    }

    // Log to structured logger as well for debugging
    logger.info("Audit event logged", {
      auditId: data.id,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      userId: context.userId,
      practiceId: context.practiceId,
      phiAccessed,
    });

    return data.id;
  } catch (error) {
    // Catch-all error handling - audit logging must not throw
    logger.error("Audit logging error", {
      error: error instanceof Error ? error.message : "Unknown error",
      entry: {
        action: entry.action,
        resourceType: entry.resourceType,
      },
    });
    return null;
  }
}

/**
 * Convenience function to log a PHI view action
 */
export async function logPHIAccess(
  resourceType: AuditResourceType,
  resourceId: string,
  description?: string
): Promise<string | null> {
  return logAudit({
    action: "view",
    resourceType,
    resourceId,
    description: description ?? `Viewed ${resourceType}`,
    phiAccessed: true,
  });
}

/**
 * Convenience function to log a search action
 */
export async function logSearch(
  resourceType: AuditResourceType,
  searchCriteria: Record<string, unknown>
): Promise<string | null> {
  return logAudit({
    action: "search",
    resourceType,
    description: `Searched ${resourceType}`,
    metadata: { searchCriteria },
    phiAccessed: isPHIResource(resourceType),
  });
}

/**
 * Convenience function to log a data export
 */
export async function logExport(
  resourceType: AuditResourceType,
  recordCount: number,
  format: string
): Promise<string | null> {
  return logAudit({
    action: "export",
    resourceType,
    description: `Exported ${recordCount} ${resourceType} records as ${format}`,
    metadata: { recordCount, format },
    phiAccessed: isPHIResource(resourceType),
  });
}

/**
 * Convenience function to log authentication events
 */
export async function logAuth(
  action: "login" | "logout" | "access_denied",
  email?: string,
  reason?: string
): Promise<string | null> {
  return logAudit({
    action,
    resourceType: "user",
    description:
      action === "login"
        ? `User logged in: ${email}`
        : action === "logout"
          ? `User logged out: ${email}`
          : `Access denied: ${reason}`,
    metadata: { email, reason },
  });
}

/**
 * Create an audit logger for a specific request
 * Useful for API routes to maintain request context
 */
export function createRequestAuditLogger(
  ipAddress?: string,
  userAgent?: string,
  requestId?: string
) {
  return {
    log: (entry: Omit<AuditLogEntry, "ipAddress" | "userAgent" | "requestId">) =>
      logAudit({
        ...entry,
        ipAddress,
        userAgent,
        requestId,
      }),
    view: (resourceType: AuditResourceType, resourceId: string) =>
      logAudit({
        action: "view",
        resourceType,
        resourceId,
        ipAddress,
        userAgent,
        requestId,
      }),
    create: (resourceType: AuditResourceType, resourceId: string) =>
      logAudit({
        action: "create",
        resourceType,
        resourceId,
        ipAddress,
        userAgent,
        requestId,
      }),
    update: (resourceType: AuditResourceType, resourceId: string) =>
      logAudit({
        action: "update",
        resourceType,
        resourceId,
        ipAddress,
        userAgent,
        requestId,
      }),
    delete: (resourceType: AuditResourceType, resourceId: string) =>
      logAudit({
        action: "delete",
        resourceType,
        resourceId,
        ipAddress,
        userAgent,
        requestId,
      }),
  };
}
