import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple password protection for hackathon demo
const DEMO_PASSWORD = "TebeMHMVP2026!";
const COOKIE_NAME = "mhmvp-auth";

// === SECURITY HEADERS (ZETA) ===
const SECURITY_HEADERS: Record<string, string> = {
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Enable XSS filter (legacy browsers)
  "X-XSS-Protection": "1; mode=block",
  // HTTPS enforcement
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  // Referrer policy for privacy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Permissions policy - microphone allowed for Deepgram voice recording
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=()",
  // Content Security Policy - strict with necessary exceptions
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these
    "style-src 'self' 'unsafe-inline'", // Tailwind/inline styles
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://generativelanguage.googleapis.com https://api.deepgram.com wss://*.deepgram.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

// === RATE LIMITING (ZETA) ===
// In-memory rate limit store for Edge runtime
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "/api/auth/mfa/": { limit: 5, windowMs: 60000 }, // 5/min for MFA
  "/api/auth/": { limit: 10, windowMs: 60000 }, // 10/min for auth
  "/api/substrate/": { limit: 20, windowMs: 60000 }, // 20/min for AI
  "/api/ai/": { limit: 20, windowMs: 60000 }, // 20/min for AI
  "/api/": { limit: 60, windowMs: 60000 }, // 60/min general
};

function getRateLimitConfig(pathname: string): RateLimitConfig | null {
  // Check most specific patterns first
  const patterns = Object.keys(RATE_LIMITS).sort((a, b) => b.length - a.length);
  for (const prefix of patterns) {
    if (pathname.startsWith(prefix)) {
      return RATE_LIMITS[prefix];
    }
  }
  return null;
}

function checkRateLimit(
  ip: string,
  pathname: string
): { allowed: boolean; remaining: number; resetAfter: number } {
  const config = getRateLimitConfig(pathname);
  if (!config) {
    return { allowed: true, remaining: -1, resetAfter: 0 };
  }

  // Normalize path to pattern level for rate limiting
  const key = `${ip}:${pathname.split("/").slice(0, 4).join("/")}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Cleanup old entries periodically (simple approach)
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k);
      }
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.limit - 1, resetAfter: 0 };
  }

  if (record.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count++;
  return { allowed: true, remaining: config.limit - record.count, resetAfter: 0 };
}

/**
 * Apply security headers to a response.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }
  return response;
}
// === END SECURITY (ZETA) ===

export function middleware(request: NextRequest) {
  // === RATE LIMITING FOR API ROUTES (ZETA) ===
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateLimit = checkRateLimit(ip, request.nextUrl.pathname);

    if (!rateLimit.allowed) {
      const response = new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${rateLimit.resetAfter} seconds.`,
          retryAfter: rateLimit.resetAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": rateLimit.resetAfter.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
      return applySecurityHeaders(response);
    }

    // API routes pass through with security headers
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    return applySecurityHeaders(response);
  }
  // === END RATE LIMITING (ZETA) ===

  // Skip auth for static files
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Check for auth cookie
  const authCookie = request.cookies.get(COOKIE_NAME);
  if (authCookie?.value === "authenticated") {
    return applySecurityHeaders(NextResponse.next());
  }

  // Check for password in query params (for initial auth)
  const password = request.nextUrl.searchParams.get("password");
  if (password === DEMO_PASSWORD) {
    const response = NextResponse.redirect(
      new URL(request.nextUrl.pathname, request.url)
    );
    response.cookies.set(COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return applySecurityHeaders(response);
  }

  // Show login page with security headers
  const loginResponse = new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
  <title>MHMVP Demo Access</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      max-width: 400px;
      width: 100%;
      text-align: center;
    }
    .logo {
      width: 120px;
      margin-bottom: 24px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 24px;
      margin-bottom: 8px;
    }
    p {
      color: #666;
      margin-bottom: 32px;
    }
    input {
      width: 100%;
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #E86C4F;
    }
    button {
      width: 100%;
      padding: 16px;
      background: #E86C4F;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: #d55a3f;
    }
    .error {
      color: #e74c3c;
      margin-bottom: 16px;
      display: none;
    }
    .error.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'%3E%3Ctext x='50' y='22' text-anchor='middle' font-family='Arial' font-weight='bold' font-size='24' fill='%23E86C4F'%3Etebra%3C/text%3E%3C/svg%3E" alt="Tebra" class="logo">
    <h1>MHMVP Demo</h1>
    <p>Mental Health MVP - Hackathon Demo</p>
    <p id="error" class="error">Incorrect password. Please try again.</p>
    <form id="authForm">
      <input type="password" id="password" placeholder="Enter demo password" autofocus>
      <button type="submit">Access Demo</button>
    </form>
  </div>
  <script>
    document.getElementById('authForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var password = document.getElementById('password').value;
      window.location.href = window.location.pathname + '?password=' + encodeURIComponent(password);
    });
    if (window.location.search.includes('password=')) {
      document.getElementById('error').classList.add('show');
    }
  </script>
</body>
</html>`,
    {
      status: 401,
      headers: {
        "Content-Type": "text/html",
      },
    }
  );

  return applySecurityHeaders(loginResponse);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
