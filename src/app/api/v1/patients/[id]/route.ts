/**
 * API v1: Single patient operations
 * GET /api/v1/patients/[id] - Get patient by ID
 * PATCH /api/v1/patients/[id] - Update patient
 */

import { NextRequest } from "next/server";
import {
  apiSuccess,
  apiErrorFromUnknown,
} from "@/src/lib/api/response";
import { NotFoundError, RateLimitError } from "@/src/lib/api/errors";
import {
  validateBody,
  validatePathParam,
  updatePatientSchema,
} from "@/src/lib/api/middleware/validation";
import {
  checkRateLimit,
  getClientIdentifier,
  STANDARD_RATE_LIMIT,
} from "@/src/lib/api/middleware/rate-limit";
import {
  createTimer,
  stopTimer,
  logRequest,
  logResponse,
} from "@/src/lib/api/middleware/logger";

// Mock patient data for demo
const mockPatients: Record<string, {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  dateOfBirth?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}> = {
  "p-001": {
    id: "p-001",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    status: "active",
    dateOfBirth: "1985-03-15",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  "p-002": {
    id: "p-002",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@email.com",
    phone: "(555) 234-5678",
    status: "active",
    dateOfBirth: "1990-07-22",
    createdAt: "2024-02-20T14:15:00Z",
    updatedAt: "2024-02-20T14:15:00Z",
  },
  "p-003": {
    id: "p-003",
    firstName: "Emily",
    lastName: "Williams",
    email: "emily.w@email.com",
    phone: "(555) 345-6789",
    status: "inactive",
    dateOfBirth: "1978-11-08",
    createdAt: "2024-03-10T09:00:00Z",
    updatedAt: "2024-03-10T09:00:00Z",
  },
};

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const timer = createTimer();
  logRequest(request, timer.requestId);

  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `patients:get:${clientId}`,
      STANDARD_RATE_LIMIT
    );

    if (!rateLimitResult.success) {
      throw new RateLimitError(rateLimitResult.retryAfter);
    }

    // Validate path parameter
    const { id } = await context.params;
    validatePathParam(id, "id");

    // Look up patient
    const patient = mockPatients[id];
    if (!patient) {
      throw new NotFoundError("Patient", id);
    }

    const response = apiSuccess(patient);

    const duration = stopTimer(timer);
    logResponse(request, response, timer.requestId, duration);
    response.headers.set("X-Request-ID", timer.requestId);

    return response;
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const timer = createTimer();
  logRequest(request, timer.requestId);

  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(`patients:update:${clientId}`, {
      maxRequests: 30,
      windowSeconds: 60,
      identifier: "patients:update",
    });

    if (!rateLimitResult.success) {
      throw new RateLimitError(rateLimitResult.retryAfter);
    }

    // Validate path parameter
    const { id } = await context.params;
    validatePathParam(id, "id");

    // Look up patient
    const patient = mockPatients[id];
    if (!patient) {
      throw new NotFoundError("Patient", id);
    }

    // Validate request body
    const updates = await validateBody(request, updatePatientSchema);

    // Update patient (mock)
    const updatedPatient = {
      ...patient,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // In production, save to database
    mockPatients[id] = updatedPatient;

    const response = apiSuccess(updatedPatient);

    const duration = stopTimer(timer);
    logResponse(request, response, timer.requestId, duration);
    response.headers.set("X-Request-ID", timer.requestId);

    return response;
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
