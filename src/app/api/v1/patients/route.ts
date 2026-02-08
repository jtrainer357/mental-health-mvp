/**
 * API v1: Patients list and creation
 * GET /api/v1/patients - List patients with pagination and search
 * POST /api/v1/patients - Create a new patient
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
  patientListQuerySchema,
  createPatientSchema,
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
const mockPatients = [
  {
    id: "p-001",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "p-002",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@email.com",
    phone: "(555) 234-5678",
    status: "active",
    createdAt: "2024-02-20T14:15:00Z",
  },
  {
    id: "p-003",
    firstName: "Emily",
    lastName: "Williams",
    email: "emily.w@email.com",
    phone: "(555) 345-6789",
    status: "inactive",
    createdAt: "2024-03-10T09:00:00Z",
  },
];

export async function GET(request: NextRequest) {
  const timer = createTimer();
  logRequest(request, timer.requestId);

  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `patients:list:${clientId}`,
      STANDARD_RATE_LIMIT
    );

    if (!rateLimitResult.success) {
      throw new RateLimitError(rateLimitResult.retryAfter);
    }

    // Validate query parameters
    const query = validateQuery(request, patientListQuerySchema);

    // Filter patients based on query
    let filteredPatients = [...mockPatients];

    if (query.q) {
      const searchLower = query.q.toLowerCase();
      filteredPatients = filteredPatients.filter(
        (p) =>
          p.firstName.toLowerCase().includes(searchLower) ||
          p.lastName.toLowerCase().includes(searchLower) ||
          p.email?.toLowerCase().includes(searchLower)
      );
    }

    if (query.status) {
      filteredPatients = filteredPatients.filter(
        (p) => p.status === query.status
      );
    }

    // Paginate
    const total = filteredPatients.length;
    const start = (query.page - 1) * query.limit;
    const paginatedPatients = filteredPatients.slice(
      start,
      start + query.limit
    );

    const response = apiPaginatedSuccess(paginatedPatients, {
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
    const rateLimitResult = checkRateLimit(`patients:create:${clientId}`, {
      maxRequests: 20,
      windowSeconds: 60,
      identifier: "patients:create",
    });

    if (!rateLimitResult.success) {
      throw new RateLimitError(rateLimitResult.retryAfter);
    }

    // Validate request body
    const body = await validateBody(request, createPatientSchema);

    // Create patient (mock)
    const newPatient = {
      id: `p-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response = apiCreated(newPatient);

    const duration = stopTimer(timer);
    logResponse(request, response, timer.requestId, duration);
    response.headers.set("X-Request-ID", timer.requestId);

    return response;
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
