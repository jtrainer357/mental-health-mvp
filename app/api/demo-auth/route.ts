import { NextRequest, NextResponse } from "next/server";

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "tebra2026";
const DEMO_COOKIE_NAME = "demo_access";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === DEMO_PASSWORD) {
      const response = NextResponse.json({ success: true });

      // Set cookie that expires in 7 days
      response.cookies.set(DEMO_COOKIE_NAME, DEMO_PASSWORD, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
