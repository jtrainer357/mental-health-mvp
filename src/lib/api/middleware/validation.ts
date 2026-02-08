/**
 * Zod validation schemas and middleware for API routes.
 * Provides type-safe request validation.
 */

import { z } from "zod";
import { NextRequest } from "next/server";
import { ValidationError } from "../errors";

// Common schemas
export const uuidSchema = z.string().uuid("Invalid UUID format");

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive().default(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100).default(20)),
});

export const dateSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: "Invalid date format" }
);

// Patient schemas
export const patientStatusSchema = z.enum(["active", "inactive", "archived"]);

export const patientListQuerySchema = paginationSchema.extend({
  q: z.string().max(200).optional(),
  status: patientStatusSchema.optional(),
  provider: z.string().optional(),
});

export const createPatientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  dateOfBirth: dateSchema.optional(),
  status: patientStatusSchema.default("active"),
  notes: z.string().max(5000).optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

// Appointment schemas
export const appointmentStatusSchema = z.enum([
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);

export const appointmentListQuerySchema = paginationSchema.extend({
  patientId: uuidSchema.optional(),
  providerId: z.string().optional(),
  status: appointmentStatusSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
});

export const createAppointmentSchema = z.object({
  patientId: uuidSchema,
  providerId: z.string().optional(),
  startTime: dateSchema,
  endTime: dateSchema,
  type: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  status: appointmentStatusSchema.default("scheduled"),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

// Message schemas
export const messageListQuerySchema = paginationSchema.extend({
  patientId: uuidSchema.optional(),
  unreadOnly: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export const createMessageSchema = z.object({
  patientId: uuidSchema,
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(10000),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);

  const result = schema.safeParse(searchParams);

  if (!result.success) {
    const errors = result.error.flatten();
    throw new ValidationError("Invalid query parameters", {
      fieldErrors: errors.fieldErrors,
      formErrors: errors.formErrors,
    });
  }

  return result.data;
}

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.flatten();
    throw new ValidationError("Invalid request body", {
      fieldErrors: errors.fieldErrors,
      formErrors: errors.formErrors,
    });
  }

  return result.data;
}

/**
 * Validate path parameters
 */
export function validatePathParam(
  value: string | undefined,
  name: string,
  schema: z.ZodSchema = uuidSchema
): string {
  if (!value) {
    throw new ValidationError(`Missing required path parameter: ${name}`);
  }

  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ValidationError(`Invalid path parameter: ${name}`, {
      errors: result.error.flatten().formErrors,
    });
  }

  return result.data as string;
}
