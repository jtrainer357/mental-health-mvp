/**
 * MFA Backup Codes Regeneration API Route.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/src/lib/auth/auth-options";
import { verifyTOTPCode, generateBackupCodes, hashBackupCodes, formatBackupCodes } from "@/src/lib/auth/mfa/totp";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await request.json();
    if (!code || !/^\d{6}$/.test(code.replace(/\s/g, "")))
      return NextResponse.json({ error: "Please enter a valid 6-digit code" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const { data: mfaData, error: mfaError } = await supabase
      .from("user_mfa").select("totp_secret, is_enabled").eq("user_id", session.user.id).single();

    if (mfaError || !mfaData) return NextResponse.json({ error: "MFA not configured" }, { status: 400 });
    if (!mfaData.is_enabled) return NextResponse.json({ error: "MFA is not enabled" }, { status: 400 });

    const isValid = verifyTOTPCode(mfaData.totp_secret, code);
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const ua = request.headers.get("user-agent");

    if (!isValid) {
      await supabase.from("mfa_audit_log").insert({
        user_id: session.user.id, action: "backup_regen_failed", ip_address: ip, user_agent: ua,
        success: false, failure_reason: "Invalid verification code",
      });
      return NextResponse.json({ success: false, message: "Invalid code. Please try again." }, { status: 400 });
    }

    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    await supabase.from("user_mfa").update({
      backup_codes: hashedBackupCodes, updated_at: new Date().toISOString(),
    }).eq("user_id", session.user.id);

    await supabase.from("mfa_audit_log").insert({
      user_id: session.user.id, action: "backup_regenerated", ip_address: ip, user_agent: ua, success: true,
    });

    return NextResponse.json({
      success: true, backupCodes: formatBackupCodes(backupCodes),
      message: "Backup codes have been regenerated. Previous codes are now invalid.",
    });
  } catch (error) {
    console.error("[MFA Regenerate Backup] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
