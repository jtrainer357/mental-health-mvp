import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Generate a secure random token.
 * Uses Web Crypto API for cryptographically secure randomness.
 */
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

interface ForgotPasswordRequest {
  email: string;
}

/**
 * POST /api/auth/forgot-password
 *
 * Initiates password reset flow by generating a secure token and storing it.
 * Always returns success to prevent email enumeration attacks.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ForgotPasswordRequest;
    const { email } = body;

    if (!email) {
      // Still return success to prevent enumeration
      return NextResponse.json({ success: true });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Check if user exists
    const { data: user } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", email.toLowerCase())
      .single();

    // Always return success - don't reveal if email exists
    if (!user) {
      console.info("[ForgotPassword] Request for non-existent email:", {
        email: email.toLowerCase(),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: true });
    }

    // Generate secure token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store token in database
    // Note: In a real implementation, you'd have a password_reset_tokens table
    // For now, we'll log the token (in production, send via email)
    const { error: tokenError } = await supabase.from("password_reset_tokens").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
      used: false,
      created_at: new Date().toISOString(),
    });

    if (tokenError) {
      console.error("[ForgotPassword] Token storage failed:", tokenError);
      // Still return success to prevent enumeration
      return NextResponse.json({ success: true });
    }

    // In production, send email with reset link
    // For now, log the reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    console.info("[ForgotPassword] Reset link generated:", {
      userId: user.id,
      email: user.email,
      resetUrl,
      expiresAt: expiresAt.toISOString(),
      timestamp: new Date().toISOString(),
    });

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ForgotPassword] Unexpected error:", error);
    // Return success even on error to prevent enumeration
    return NextResponse.json({ success: true });
  }
}
