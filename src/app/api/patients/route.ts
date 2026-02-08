/**
 * Patient API Routes
 * POST /api/patients - Create a new patient
 * GET /api/patients - List patients with optional filters
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logAudit } from "@/src/lib/audit";
import { logger } from "@/src/lib/logger";
import type { Database } from "@/src/lib/supabase/types";

// Supabase client with service role for API operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Gender options
const VALID_GENDERS = ["M", "F", "Non-binary", "Other", "Prefer not to say"] as const;
type Gender = (typeof VALID_GENDERS)[number];

// Patient form data for creation
export interface CreatePatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  gender?: Gender;
  pronouns?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  insuranceProvider?: string;
  insuranceMemberId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  practiceId: string;
  force?: boolean;
}

// Validation helpers
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

function isValidDateOfBirth(dob: string): boolean {
  const date = new Date(dob);
  if (isNaN(date.getTime())) return false;
  return date < new Date();
}

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

/**
 * POST /api/patients
 * Create a new patient
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreatePatientData;
    const forceCreate = request.nextUrl.searchParams.get("force") === "true" || body.force;

    // Validate required fields
    const errors: string[] = [];
    if (!body.firstName?.trim()) errors.push("First name is required");
    if (!body.lastName?.trim()) errors.push("Last name is required");
    if (!body.dateOfBirth) {
      errors.push("Date of birth is required");
    } else if (!isValidDateOfBirth(body.dateOfBirth)) {
      errors.push("Date of birth is invalid or in the future");
    }
    if (!body.phone) {
      errors.push("Phone number is required");
    } else if (!isValidPhone(body.phone)) {
      errors.push("Phone number is invalid");
    }
    if (!body.email) {
      errors.push("Email is required");
    } else if (!isValidEmail(body.email)) {
      errors.push("Email format is invalid");
    }
    if (!body.practiceId) errors.push("Practice ID is required");
    if (body.gender && !VALID_GENDERS.includes(body.gender as Gender)) {
      errors.push("Invalid gender value");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error("[API] Supabase not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Check for duplicate patient (same name + DOB) unless force is true
    if (!forceCreate) {
      const { data: existingPatients } = await supabase
        .from("patients")
        .select("id, first_name, last_name, date_of_birth")
        .eq("practice_id", body.practiceId)
        .ilike("first_name", body.firstName.trim())
        .ilike("last_name", body.lastName.trim())
        .eq("date_of_birth", body.dateOfBirth);

      if (existingPatients && existingPatients.length > 0) {
        const existing = existingPatients[0];
        return NextResponse.json(
          {
            error: "duplicate_found",
            message: `A patient named ${existing?.first_name} ${existing?.last_name} with DOB ${existing?.date_of_birth} already exists.`,
            existingPatient: existing,
          },
          { status: 409 }
        );
      }
    }

    // Insert new patient
    const { data: patient, error } = await supabase
      .from("patients")
      .insert({
        practice_id: body.practiceId,
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        date_of_birth: body.dateOfBirth,
        phone_mobile: formatPhoneNumber(body.phone),
        email: body.email.toLowerCase().trim(),
        gender: (body.gender as Gender) || null,
        address_street: body.addressStreet?.trim() || null,
        address_city: body.addressCity?.trim() || null,
        address_state: body.addressState?.trim() || null,
        address_zip: body.addressZip?.trim() || null,
        insurance_provider: body.insuranceProvider?.trim() || null,
        insurance_member_id: body.insuranceMemberId?.trim() || null,
        status: "Active",
      })
      .select()
      .single();

    if (error) {
      logger.error("[API] Failed to create patient", { error: error.message });
      return NextResponse.json({ error: "Failed to create patient", details: error.message }, { status: 500 });
    }

    await logAudit({
      action: "create",
      resourceType: "patient",
      resourceId: patient.id,
      practiceId: body.practiceId,
      details: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth,
      },
    });

    logger.info("[API] Patient created successfully", { patientId: patient.id });
    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    logger.error("[API] Error creating patient", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/patients
 * List patients with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const practiceId = searchParams.get("practiceId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const sortBy = searchParams.get("sortBy") || "last_name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    if (!practiceId) {
      return NextResponse.json({ error: "Practice ID is required" }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error("[API] Supabase not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    let query = supabase
      .from("patients")
      .select("*", { count: "exact" })
      .eq("practice_id", practiceId);

    // Filter by status
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Search by name, email, phone
    if (search && search.length >= 2) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone_mobile.ilike.%${search}%`
      );
    }

    // Sorting
    const validSortColumns = ["last_name", "first_name", "created_at", "status"];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "last_name";
    query = query.order(sortColumn, { ascending: sortOrder === "asc" });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: patients, error, count } = await query;

    if (error) {
      logger.error("[API] Failed to fetch patients", { error: error.message });
      return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
    }

    return NextResponse.json({
      patients: patients || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    });
  } catch (error) {
    logger.error("[API] Error fetching patients", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
