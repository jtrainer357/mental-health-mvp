/**
 * MFA Disable API Route.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/src/lib/auth/auth-options";
import { verifyTOTPCode } from "@/src/lib/auth/mfa/totp";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function DELETE(request: NextRequest): Promise<NextResponse> {
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
        user_id: session.user.id, action: "disable_failed", ip_address: ip, user_agent: ua,
        success: false, failure_reason: "Invalid verification code",
      });
      return NextResponse.json({ success: false, message: "Invalid code. Please try again." }, { status: 400 });
    }

    await supabase.from("user_mfa").delete().eq("user_id", session.user.id);
    await supabase.from("users").update({ mfa_enabled: false, mfa_pending: false }).eq("id", session.user.id);
    await supabase.from("mfa_audit_log").insert({
      user_id: session.user.id, action: "mfa_disabled", ip_address: ip, user_agent: ua, success: true,
    });

    return NextResponse.json({ success: true, message: "Two-factor authentication has been disabled" });
  } catch (error) {
    console.error("[MFA Disable] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
