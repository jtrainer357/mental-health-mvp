/**
 * API v1: Messages list and creation
 * GET /api/v1/messages - List messages with filtering
 * POST /api/v1/messages - Send a new message
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
  messageListQuerySchema,
  createMessageSchema,
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

// Mock message data for demo
const mockMessages = [
  {
    id: "msg-001",
    patientId: "p-001",
    patientName: "Sarah Johnson",
    subject: "Appointment Reminder",
    body: "This is a reminder for your upcoming appointment tomorrow at 9:00 AM.",
    priority: "normal",
    read: true,
    sentAt: "2026-02-06T14:00:00Z",
    createdAt: "2026-02-06T14:00:00Z",
  },
  {
    id: "msg-002",
    patientId: "p-002",
    patientName: "Michael Chen",
    subject: "Lab Results Available",
    body: "Your recent lab results are now available. Please log in to view them.",
    priority: "high",
    read: false,
    sentAt: "2026-02-06T16:30:00Z",
    createdAt: "2026-02-06T16:30:00Z",
  },
  {
    id: "msg-003",
    patientId: "p-001",
    patientName: "Sarah Johnson",
    subject: "Prescription Refill",
    body: "Your prescription has been refilled and is ready for pickup.",
    priority: "normal",
    read: false,
    sentAt: "2026-02-07T09:00:00Z",
    createdAt: "2026-02-07T09:00:00Z",
  },
];

export async function GET(request: NextRequest) {
  const timer = createTimer();
  logRequest(request, timer.requestId);

  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `messages:list:${clientId}`,
      STANDARD_RATE_LIMIT
    );

    if (!rateLimitResult.success) {
      throw new RateLimitError(rateLimitResult.retryAfter);
    }

    // Validate query parameters
    const query = validateQuery(request, messageListQuerySchema);

    // Filter messages based on query
    let filteredMessages = [...mockMessages];

    if (query.patientId) {
      filteredMessages = filteredMessages.filter(
        (m) => m.patientId === query.patientId
      );
    }

    if (query.unreadOnly) {
      filteredMessages = filteredMessages.filter((m) => !m.read);
    }

    // Paginate
    const total = filteredMessages.length;
    const start = (query.page - 1) * query.limit;
    const paginatedMessages = filteredMessages.slice(
      start,
      start + query.limit
    );

    const response = apiPaginatedSuccess(paginatedMessages, {
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
    // Rate limiting (stricter for message creation)
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(`messages:create:${clientId}`, {
      maxRequests: 50,
      windowSeconds: 60,
      identifier: "messages:create",
    });

    if (!rateLimitResult.success) {
      throw new RateLimitError(rateLimitResult.retryAfter);
    }

    // Validate request body
    const body = await validateBody(request, createMessageSchema);

    // Create message (mock)
    const newMessage = {
      id: `msg-${Date.now()}`,
      ...body,
      patientName: "Patient Name", // In production, look up from patient
      read: false,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const response = apiCreated(newMessage);

    const duration = stopTimer(timer);
    logResponse(request, response, timer.requestId, duration);
    response.headers.set("X-Request-ID", timer.requestId);

    return response;
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
