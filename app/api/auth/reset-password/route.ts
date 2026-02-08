import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Hash password using SHA-256.
 * In production, use bcrypt or argon2 for better security.
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

/**
 * POST /api/auth/reset-password
 *
 * Validates reset token and updates user password.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResetPasswordRequest;
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Find the token
    const { data: resetToken, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used")
      .eq("token", token)
      .single();

    if (tokenError || !resetToken) {
      console.warn("[ResetPassword] Invalid token:", {
        token: token.substring(0, 8) + "...",
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    // Check if token is used
    if (resetToken.used) {
      return NextResponse.json(
        { error: "This reset link has already been used" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ error: "This reset link has expired" }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resetToken.user_id);

    if (updateError) {
      console.error("[ResetPassword] Password update failed:", updateError);
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    // Mark token as used
    await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("id", resetToken.id);

    console.info("[ResetPassword] Password reset successful:", {
      userId: resetToken.user_id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("[ResetPassword] Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
