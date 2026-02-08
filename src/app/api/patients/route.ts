/**
 * Patient API Routes
 * POST /api/patients - Create a new patient with duplicate detection
 * GET /api/patients - List patients with pagination, search, and filters
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logAudit } from "@/src/lib/audit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * POST /api/patients
 * Creates a new patient with duplicate detection
 */
export async function POST(request: NextRequest) {
  try {
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
      force = false,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !phone || !email || !practiceId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: firstName, lastName, dateOfBirth, phone, email, practiceId",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Check for duplicates (unless force=true)
    if (!force) {
      const { data: existingPatients } = await supabase
        .from("patients")
        .select("id, first_name, last_name, date_of_birth")
        .eq("practice_id", practiceId)
        .eq("first_name", firstName.trim())
        .eq("last_name", lastName.trim())
        .eq("date_of_birth", dateOfBirth)
        .neq("status", "Discharged")
        .limit(1);

      if (existingPatients && existingPatients.length > 0) {
        return NextResponse.json(
          {
            error: "duplicate_found",
            message: `A patient named ${firstName} ${lastName} with DOB ${dateOfBirth} already exists.`,
            existingPatient: existingPatients[0],
          },
          { status: 409 }
        );
      }
    }

    // Create the patient
    const { data: patient, error } = await supabase
      .from("patients")
      .insert({
        practice_id: practiceId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth,
        phone_mobile: phone.replace(/\D/g, ""),
        email: email.toLowerCase().trim(),
        gender: gender || null,
        pronouns: pronouns || null,
        address_street: addressStreet || null,
        address_city: addressCity || null,
        address_state: addressState || null,
        address_zip: addressZip || null,
        insurance_provider: insuranceProvider || null,
        insurance_member_id: insuranceMemberId || null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_phone: emergencyContactPhone?.replace(/\D/g, "") || null,
        status: "Active",
      })
      .select()
      .single();

    if (error) {
      console.error("[API] Failed to create patient:", error);
      return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
    }

    // Audit log for HIPAA compliance
    await logAudit({
      action: "create",
      resourceType: "patient",
      resourceId: patient.id,
      practiceId,
      details: { firstName, lastName, dateOfBirth, forcedDuplicate: force },
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    console.error("[API] Patient creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/patients
 * Lists patients with pagination, search, and status filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const practiceId = searchParams.get("practiceId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "Active";
    const sortBy = searchParams.get("sortBy") || "last_name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    if (!practiceId) {
      return NextResponse.json({ error: "practiceId is required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Build query
    let query = supabase
      .from("patients")
      .select("*", { count: "exact" })
      .eq("practice_id", practiceId);

    // Filter by status
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Search by name or email
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    // Sorting
    const validSortColumns = [
      "first_name",
      "last_name",
      "date_of_birth",
      "created_at",
      "updated_at",
    ];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "last_name";
    query = query.order(sortColumn, { ascending: sortOrder === "asc" });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: patients, error, count } = await query;

    if (error) {
      console.error("[API] Failed to fetch patients:", error);
      return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
    }

    return NextResponse.json({
      patients,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("[API] Patient list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
