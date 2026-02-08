/**
 * MFA Status API Route.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/src/lib/auth/auth-options";
import type { MFAStatus } from "@/src/lib/auth/mfa/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const { data: mfaData } = await supabase
      .from("user_mfa")
      .select("is_enabled, enabled_at, backup_codes")
      .eq("user_id", session.user.id)
      .single();

    const { data: userData } = await supabase
      .from("users")
      .select("mfa_pending")
      .eq("id", session.user.id)
      .single();

    const status: MFAStatus = {
      isEnabled: mfaData?.is_enabled || false,
      isPending: userData?.mfa_pending || false,
      enabledAt: mfaData?.enabled_at || null,
      backupCodesRemaining: mfaData?.backup_codes?.length || 0,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error("[MFA Status] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
