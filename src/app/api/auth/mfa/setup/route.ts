/**
 * MFA Setup API Route.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/src/lib/auth/auth-options";
import {
  generateTOTPSecret, generateQRCode, verifyTOTPCode,
  generateBackupCodes, hashBackupCodes, formatBackupCodes,
} from "@/src/lib/auth/mfa/totp";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const { data: existingMfa } = await supabase.from("user_mfa").select("is_enabled").eq("user_id", session.user.id).single();
    if (existingMfa?.is_enabled) return NextResponse.json({ error: "MFA is already enabled" }, { status: 400 });

    const { secret, uri } = generateTOTPSecret(session.user.email);
    const qrCodeDataUrl = await generateQRCode(uri);

    await supabase.from("user_mfa").upsert({
      user_id: session.user.id, totp_secret: secret, backup_codes: [], is_enabled: false, updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    await supabase.from("mfa_audit_log").insert({
      user_id: session.user.id, action: "setup_initiated",
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"), success: true,
    });

    return NextResponse.json({ qrCodeDataUrl, secret, message: "Scan the QR code with your authenticator app" });
  } catch (error) {
    console.error("[MFA Setup] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await request.json();
    if (!code || !/^\d{6}$/.test(code.replace(/\s/g, "")))
      return NextResponse.json({ error: "Please enter a valid 6-digit code" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const { data: mfaData, error: mfaError } = await supabase
      .from("user_mfa").select("totp_secret, is_enabled").eq("user_id", session.user.id).single();
    if (mfaError || !mfaData) return NextResponse.json({ error: "MFA setup not initialized" }, { status: 400 });
    if (mfaData.is_enabled) return NextResponse.json({ error: "MFA is already enabled" }, { status: 400 });

    const isValid = verifyTOTPCode(mfaData.totp_secret, code);
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const ua = request.headers.get("user-agent");

    if (!isValid) {
      await supabase.from("mfa_audit_log").insert({
        user_id: session.user.id, action: "setup_completed", ip_address: ip, user_agent: ua,
        success: false, failure_reason: "Invalid verification code",
      });
      return NextResponse.json({ success: false, message: "Invalid code. Please check your authenticator app." }, { status: 400 });
    }

    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    await supabase.from("user_mfa").update({
      backup_codes: hashedBackupCodes, is_enabled: true, enabled_at: new Date().toISOString(),
      last_verified_at: new Date().toISOString(), failed_attempts: 0, locked_until: null,
    }).eq("user_id", session.user.id);

    await supabase.from("users").update({ mfa_enabled: true }).eq("id", session.user.id);
    await supabase.from("mfa_audit_log").insert({
      user_id: session.user.id, action: "setup_completed", ip_address: ip, user_agent: ua, success: true,
    });

    return NextResponse.json({ success: true, backupCodes: formatBackupCodes(backupCodes), message: "MFA has been enabled" });
  } catch (error) {
    console.error("[MFA Setup Verify] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
