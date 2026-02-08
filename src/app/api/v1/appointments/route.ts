/**
 * API v1: Appointments list and creation
 * GET /api/v1/appointments - List appointments with filtering
 * POST /api/v1/appointments - Create a new appointment
 */

import { NextRequest } from "next/server";
import {
  apiPaginatedSuccess,
  apiCreated,
  apiErrorFromUnknown,
} from "@/src/lib/api/response";
import { RateLimitError } from "@/src/lib/api/errors";
import {
  validateQuery,
  validateBody,
  appointmentListQuerySchema,
  createAppointmentSchema,
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

// Mock appointment data for demo
const mockAppointments = [
  {
    id: "apt-001",
    patientId: "p-001",
    patientName: "Sarah Johnson",
    providerId: "dr-001",
    providerName: "Dr. Smith",
    startTime: "2026-02-07T09:00:00Z",
    endTime: "2026-02-07T10:00:00Z",
    type: "Initial Consultation",
    status: "confirmed",
    notes: "",
    createdAt: "2026-02-01T10:30:00Z",
  },
  {
    id: "apt-002",
    patientId: "p-002",
    patientName: "Michael Chen",
    providerId: "dr-001",
    providerName: "Dr. Smith",
    startTime: "2026-02-07T10:30:00Z",
    endTime: "2026-02-07T11:30:00Z",
    type: "Follow-up",
    status: "scheduled",
    notes: "",
    createdAt: "2026-02-02T14:15:00Z",
  },
  {
    id: "apt-003",
    patientId: "p-003",
    patientName: "Emily Williams",
    providerId: "dr-002",
    providerName: "Dr. Jones",
    startTime: "2026-02-07T14:00:00Z",
    endTime: "2026-02-07T15:00:00Z",
    type: "Therapy Session",
    status: "confirmed",
    notes: "",
    createdAt: "2026-02-03T09:00:00Z",
  },
];

export async function GET(request: NextRequest) {
  const timer = createTimer();
  logRequest(request, timer.requestId);

  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `appointments:list:${clientId}`,
      STANDARD_RATE_LIMIT
    );

    if (!rateLimitResult.success) {
      throw new RateLimitError(rateLimitResult.retryAfter);
    }

    // Validate query parameters
    const query = validateQuery(request, appointmentListQuerySchema);

    // Filter appointments based on query
    let filteredAppointments = [...mockAppointments];

    if (query.patientId) {
      filteredAppointments = filteredAppointments.filter(
        (a) => a.patientId === query.patientId
      );
    }

    if (query.providerId) {
      filteredAppointments = filteredAppointments.filter(
        (a) => a.providerId === query.providerId
      );
    }

    if (query.status) {
      filteredAppointments = filteredAppointments.filter(
        (a) => a.status === query.status
      );
    }

    if (query.startDate) {
      const startDate = new Date(query.startDate);
      filteredAppointments = filteredAppointments.filter(
        (a) => new Date(a.startTime) >= startDate
      );
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      filteredAppointments = filteredAppointments.filter(
        (a) => new Date(a.startTime) <= endDate
      );
    }

    // Paginate
    const total = filteredAppointments.length;
    const start = (query.page - 1) * query.limit;
    const paginatedAppointments = filteredAppointments.slice(
      start,
      start + query.limit
    );

    const response = apiPaginatedSuccess(paginatedAppointments, {
      page: query.page,
      limit: query.limit,
      total,
    });

    const duration = stopTimer(timer);
    logResponse(request, response, timer.requestId, duration);
    response.headers.set("X-Request-ID", timer.requestId);

    return response;
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}

export async function POST(request: NextRequest) {
  const timer = createTimer();
  logRequest(request, timer.requestId);

  try {
    // Rate limiting (stricter for creation)
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(`appointments:create:${clientId}`, {
      maxRequests: 30,
      windowSeconds: 60,
      identifier: "appointments:create",
    });

    if (!rateLimitResult.success) {
      throw new RateLimitError(rateLimitResult.retryAfter);
    }

    // Validate request body
    const body = await validateBody(request, createAppointmentSchema);

    // Create appointment (mock)
    const newAppointment = {
      id: `apt-${Date.now()}`,
      ...body,
      patientName: "New Patient", // In production, look up from patient
      providerName: "Dr. Smith", // In production, look up from provider
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response = apiCreated(newAppointment);

    const duration = stopTimer(timer);
    logResponse(request, response, timer.requestId, duration);
    response.headers.set("X-Request-ID", timer.requestId);

    return response;
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
