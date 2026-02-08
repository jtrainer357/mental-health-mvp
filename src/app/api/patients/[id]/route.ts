/**
 * Patient Individual API Routes
 * GET /api/patients/[id] - Get patient by ID
 * PATCH /api/patients/[id] - Update patient demographics
 * DELETE /api/patients/[id] - Soft delete (archive) patient
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logAudit } from "@/src/lib/audit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/patients/[id]
 * Retrieves a single patient by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const practiceId = searchParams.get("practiceId");

    if (!practiceId) {
      return NextResponse.json({ error: "practiceId is required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: patient, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .eq("practice_id", practiceId)
      .single();

    if (error || !patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Audit log for PHI access
    await logAudit({
      action: "view",
      resourceType: "patient",
      resourceId: id,
      practiceId,
    });

    return NextResponse.json({ patient });
  } catch (error) {
    console.error("[API] Get patient error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/patients/[id]
 * Updates patient demographics with audit logging
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      phone,
      email,
      gender,
      pronouns,
      addressStreet,
      addressCity,
      addressState,
      addressZip,
      insuranceProvider,
      insuranceMemberId,
      emergencyContactName,
      emergencyContactPhone,
      practiceId,
    } = body;

    if (!practiceId) {
      return NextResponse.json({ error: "practiceId is required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Get current patient for audit log
    const { data: currentPatient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .eq("practice_id", practiceId)
      .single();

    if (!currentPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (firstName !== undefined) updateData.first_name = firstName.trim();
    if (lastName !== undefined) updateData.last_name = lastName.trim();
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth;
    if (phone !== undefined) updateData.phone_mobile = phone.replace(/\D/g, "");
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (gender !== undefined) updateData.gender = gender;
    if (pronouns !== undefined) updateData.pronouns = pronouns;
    if (addressStreet !== undefined) updateData.address_street = addressStreet;
    if (addressCity !== undefined) updateData.address_city = addressCity;
    if (addressState !== undefined) updateData.address_state = addressState;
    if (addressZip !== undefined) updateData.address_zip = addressZip;
    if (insuranceProvider !== undefined) updateData.insurance_provider = insuranceProvider;
    if (insuranceMemberId !== undefined) updateData.insurance_member_id = insuranceMemberId;
    if (emergencyContactName !== undefined)
      updateData.emergency_contact_name = emergencyContactName;
    if (emergencyContactPhone !== undefined)
      updateData.emergency_contact_phone = emergencyContactPhone?.replace(/\D/g, "");

    const { data: patient, error } = await supabase
      .from("patients")
      .update(updateData)
      .eq("id", id)
      .eq("practice_id", practiceId)
      .select()
      .single();

    if (error) {
      console.error("[API] Failed to update patient:", error);
      return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
    }

    // Audit log with old and new values
    await logAudit({
      action: "update",
      resourceType: "patient",
      resourceId: id,
      practiceId,
      oldValues: currentPatient,
      newValues: patient,
      details: { updatedFields: Object.keys(updateData).filter((k) => k !== "updated_at") },
    });

    return NextResponse.json({ patient });
  } catch (error) {
    console.error("[API] Update patient error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/patients/[id]
 * Soft deletes a patient by setting status to "Discharged"
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { practiceId, reason } = body;

    if (!practiceId) {
      return NextResponse.json({ error: "practiceId is required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Get current patient for audit log
    const { data: currentPatient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .eq("practice_id", practiceId)
      .single();

    if (!currentPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Soft delete by setting status to Discharged
    const { data: patient, error } = await supabase
      .from("patients")
      .update({
        status: "Discharged",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("practice_id", practiceId)
      .select()
      .single();

    if (error) {
      console.error("[API] Failed to archive patient:", error);
      return NextResponse.json({ error: "Failed to archive patient" }, { status: 500 });
    }

    // Audit log for sensitive delete operation
    await logAudit({
      action: "delete",
      resourceType: "patient",
      resourceId: id,
      practiceId,
      oldValues: { status: currentPatient.status },
      newValues: { status: "Discharged" },
      details: { reason: reason || "Archived via patient management" },
      isSensitive: true,
    });

    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.error("[API] Archive patient error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
