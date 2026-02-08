/**
 * Individual Patient API Routes
 * GET /api/patients/[id] - Get a single patient
 * PATCH /api/patients/[id] - Update patient demographics
 * DELETE /api/patients/[id] - Soft delete (archive) a patient
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logAudit } from "@/src/lib/audit";
import { logger } from "@/src/lib/logger";
import type { Database } from "@/src/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Valid gender values
const VALID_GENDERS = ["M", "F", "Non-binary", "Other", "Prefer not to say"] as const;
type Gender = (typeof VALID_GENDERS)[number];

// Update patient data interface
interface UpdatePatientData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  gender?: Gender;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  insuranceProvider?: string;
  insuranceMemberId?: string;
  practiceId: string;
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

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

/**
 * GET /api/patients/[id]
 * Get a single patient by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const practiceId = searchParams.get("practiceId");

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

    const { data: patient, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .eq("practice_id", practiceId)
      .is("deleted_at", null)
      .single();

    if (error || !patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Log PHI access
    await logAudit({
      action: "view",
      resourceType: "patient",
      resourceId: id,
      practiceId,
      isPhiAccess: true,
    });

    return NextResponse.json({ patient });
  } catch (error) {
    logger.error("[API] Error fetching patient", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/patients/[id]
 * Update patient demographics
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdatePatientData;

    if (!body.practiceId) {
      return NextResponse.json({ error: "Practice ID is required" }, { status: 400 });
    }

    // Validate optional fields
    const errors: string[] = [];
    if (body.email && !isValidEmail(body.email)) {
      errors.push("Email format is invalid");
    }
    if (body.phone && !isValidPhone(body.phone)) {
      errors.push("Phone number is invalid");
    }
    if (body.gender && !VALID_GENDERS.includes(body.gender)) {
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

    // Fetch current patient for audit log
    const { data: currentPatient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .eq("practice_id", body.practiceId)
      .single();

    if (!currentPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.firstName !== undefined) updateData.first_name = body.firstName.trim();
    if (body.lastName !== undefined) updateData.last_name = body.lastName.trim();
    if (body.dateOfBirth !== undefined) updateData.date_of_birth = body.dateOfBirth;
    if (body.phone !== undefined) updateData.phone_mobile = formatPhoneNumber(body.phone);
    if (body.email !== undefined) updateData.email = body.email.toLowerCase().trim();
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.addressStreet !== undefined) updateData.address_street = body.addressStreet.trim();
    if (body.addressCity !== undefined) updateData.address_city = body.addressCity.trim();
    if (body.addressState !== undefined) updateData.address_state = body.addressState.trim();
    if (body.addressZip !== undefined) updateData.address_zip = body.addressZip.trim();
    if (body.insuranceProvider !== undefined) updateData.insurance_provider = body.insuranceProvider.trim();
    if (body.insuranceMemberId !== undefined) updateData.insurance_member_id = body.insuranceMemberId.trim();

    const { data: patient, error } = await supabase
      .from("patients")
      .update(updateData)
      .eq("id", id)
      .eq("practice_id", body.practiceId)
      .select()
      .single();

    if (error) {
      logger.error("[API] Failed to update patient", { error: error.message });
      return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
    }

    // Log audit event with changes
    await logAudit({
      action: "update",
      resourceType: "patient",
      resourceId: id,
      practiceId: body.practiceId,
      oldValues: currentPatient,
      newValues: patient,
      isPhiAccess: true,
    });

    logger.info("[API] Patient updated successfully", { patientId: id });
    return NextResponse.json({ patient });
  } catch (error) {
    logger.error("[API] Error updating patient", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/patients/[id]
 * Soft delete (archive) a patient - sets deleted_at timestamp
 * Does NOT actually delete the record (HIPAA compliance)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const practiceId = body.practiceId;

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

    // Verify patient exists
    const { data: currentPatient } = await supabase
      .from("patients")
      .select("id, first_name, last_name")
      .eq("id", id)
      .eq("practice_id", practiceId)
      .is("deleted_at", null)
      .single();

    if (!currentPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Soft delete - set deleted_at timestamp
    const { error } = await supabase
      .from("patients")
      .update({
        deleted_at: new Date().toISOString(),
        status: "Discharged",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("practice_id", practiceId);

    if (error) {
      logger.error("[API] Failed to archive patient", { error: error.message });
      return NextResponse.json({ error: "Failed to archive patient" }, { status: 500 });
    }

    // Log audit event
    await logAudit({
      action: "delete",
      resourceType: "patient",
      resourceId: id,
      practiceId,
      details: {
        patientName: `${currentPatient.first_name} ${currentPatient.last_name}`,
        softDelete: true,
      },
      isPhiAccess: true,
      isSensitive: true,
    });

    logger.info("[API] Patient archived successfully", { patientId: id });
    return NextResponse.json({ success: true, message: "Patient archived successfully" });
  } catch (error) {
    logger.error("[API] Error archiving patient", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
