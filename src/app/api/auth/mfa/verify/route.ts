/**
 * MFA Verification API Route.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/src/lib/auth/auth-options";
import { verifyTOTPCode, verifyBackupCode } from "@/src/lib/auth/mfa/totp";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code, useBackupCode = false } = await request.json();
    if (!code) return NextResponse.json({ error: "Verification code is required" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const { data: mfaData, error: mfaError } = await supabase.from("user_mfa").select("*").eq("user_id", session.user.id).single();
    if (mfaError || !mfaData) return NextResponse.json({ error: "MFA not configured" }, { status: 400 });
    if (!mfaData.is_enabled) return NextResponse.json({ error: "MFA is not enabled" }, { status: 400 });

    if (mfaData.locked_until) {
      const lockedUntil = new Date(mfaData.locked_until);
      if (lockedUntil > new Date()) {
        const minutesRemaining = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
        return NextResponse.json({
          success: false, message: `Too many failed attempts. Please try again in ${minutesRemaining} minute(s).`,
          lockedUntil: mfaData.locked_until,
        }, { status: 429 });
      }
    }

    let isValid = false;
    let newBackupCodes = mfaData.backup_codes;
    let auditAction = "verify_success";

    if (useBackupCode) {
      const result = await verifyBackupCode(mfaData.backup_codes, code);
      isValid = result.valid;
      newBackupCodes = result.remaining;
      if (isValid) auditAction = "backup_used";
    } else {
      if (!/^\d{6}$/.test(code.replace(/\s/g, "")))
        return NextResponse.json({ error: "Please enter a valid 6-digit code" }, { status: 400 });
      isValid = verifyTOTPCode(mfaData.totp_secret, code);
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const ua = request.headers.get("user-agent");

    if (!isValid) {
      const newFailedAttempts = (mfaData.failed_attempts || 0) + 1;
      const attemptsRemaining = MAX_FAILED_ATTEMPTS - newFailedAttempts;
      let lockedUntil: string | null = null;
      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();

      await supabase.from("user_mfa").update({ failed_attempts: newFailedAttempts, locked_until: lockedUntil }).eq("user_id", session.user.id);
      await supabase.from("mfa_audit_log").insert({
        user_id: session.user.id, action: "verify_failed", ip_address: ip, user_agent: ua,
        success: false, failure_reason: useBackupCode ? "Invalid backup code" : "Invalid TOTP code",
      });

      if (lockedUntil) return NextResponse.json({ success: false, message: "Too many failed attempts. Your account has been locked for 15 minutes.", lockedUntil }, { status: 429 });
      return NextResponse.json({ success: false, message: useBackupCode ? "Invalid backup code." : "Invalid code.", attemptsRemaining: Math.max(0, attemptsRemaining) }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { failed_attempts: 0, locked_until: null, last_verified_at: new Date().toISOString() };
    if (useBackupCode) updateData.backup_codes = newBackupCodes;

    await supabase.from("user_mfa").update(updateData).eq("user_id", session.user.id);
    await supabase.from("users").update({ mfa_pending: false }).eq("id", session.user.id);
    await supabase.from("mfa_audit_log").insert({ user_id: session.user.id, action: auditAction, ip_address: ip, user_agent: ua, success: true });

    return NextResponse.json({
      success: true,
      message: useBackupCode ? `Backup code accepted. ${newBackupCodes.length} codes remaining.` : "Verification successful",
    });
  } catch (error) {
    console.error("[MFA Verify] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
