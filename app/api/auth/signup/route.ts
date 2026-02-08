import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Hash password using Web Crypto API (compatible with Edge runtime).
 * Same implementation as auth-options.ts for consistency.
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  practiceName: string;
  specialty: string;
  state: string;
}

/**
 * POST /api/auth/signup
 * Creates a new user account and practice in Supabase.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SignupRequest;

    // Validate required fields
    const { fullName, email, password, practiceName, specialty, state } = body;

    if (!fullName || !email || !password || !practiceName || !specialty || !state) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength (minimum requirements)
    if (password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Start a transaction-like flow: create practice first, then user, then membership
    // Create the practice
    const { data: practice, error: practiceError } = await supabase
      .from("practices")
      .insert({
        name: practiceName,
        specialty,
        state,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, name")
      .single();

    if (practiceError) {
      console.error("[Signup] Practice creation failed:", practiceError);
      return NextResponse.json(
        { error: "Failed to create practice" },
        { status: 500 }
      );
    }

    // Create the user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name: fullName,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, email, name")
      .single();

    if (userError) {
      console.error("[Signup] User creation failed:", userError);
      // Attempt to clean up the practice we just created
      await supabase.from("practices").delete().eq("id", practice.id);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Create the practice membership (user-practice relationship)
    const { error: membershipError } = await supabase
      .from("practice_users")
      .insert({
        user_id: user.id,
        practice_id: practice.id,
        role: "owner",
        is_active: true,
        joined_at: new Date().toISOString(),
      });

    if (membershipError) {
      console.error("[Signup] Membership creation failed:", membershipError);
      // Clean up both user and practice
      await supabase.from("users").delete().eq("id", user.id);
      await supabase.from("practices").delete().eq("id", practice.id);
      return NextResponse.json(
        { error: "Failed to set up practice membership" },
        { status: 500 }
      );
    }

    // Log successful signup
    console.info("[Signup] Account created successfully:", {
      userId: user.id,
      email: user.email,
      practiceId: practice.id,
      practiceName: practice.name,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        practice: {
          id: practice.id,
          name: practice.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Signup] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
