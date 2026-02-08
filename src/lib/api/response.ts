/**
 * Standardized API response helpers.
 * Provides consistent response format across all endpoints.
 */

import { NextResponse } from "next/server";
import { ApiError, isApiError } from "./errors";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  meta?: PaginationMeta;
  timestamp: string;
}

/**
 * Create a successful API response
 */
export function apiSuccess<T>(
  data: T,
  meta?: PaginationMeta,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Create a paginated success response
 */
export function apiPaginatedSuccess<T>(
  data: T[],
  options: {
    page: number;
    limit: number;
    total: number;
  }
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(options.total / options.limit);
  const meta: PaginationMeta = {
    page: options.page,
    limit: options.limit,
    total: options.total,
    totalPages,
    hasNext: options.page < totalPages,
    hasPrevious: options.page > 1,
  };

  return apiSuccess(data, meta);
}

/**
 * Create a created (201) response
 */
export function apiCreated<T>(data: T): NextResponse<ApiResponse<T>> {
  return apiSuccess(data, undefined, 201);
}

/**
 * Create an error response from an ApiError
 */
export function apiError(error: ApiError): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
      timestamp: new Date().toISOString(),
    },
    { status: error.statusCode }
  );
}

/**
 * Handle unknown errors and convert to API response
 */
export function apiErrorFromUnknown(
  error: unknown,
  fallbackMessage = "An unexpected error occurred"
): NextResponse<ApiResponse<never>> {
  if (isApiError(error)) {
    return apiError(error);
  }

  const message = error instanceof Error ? error.message : fallbackMessage;

  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: "INTERNAL_ERROR",
      },
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

/**
 * Create a no content (204) response
 */
export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
