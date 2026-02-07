"use client";

import { useEffect } from "react";

/**
 * Next.js global error boundary
 * Catches errors in the root layout - uses inline styles since CSS may not be loaded
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console with structured format since logger may not be available
    console.error("[GlobalError] Critical application error:", {
      message: error.message,
      name: error.name,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#FEE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DC2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827", margin: 0 }}>
            Application Error
          </h1>
          <p
            style={{
              color: "#6B7280",
              textAlign: "center",
              maxWidth: "400px",
              marginTop: "0.5rem",
            }}
          >
            A critical error occurred. Please refresh the page or try again later.
          </p>
          {error.digest && (
            <p style={{ color: "#9CA3AF", fontSize: "0.875rem", marginTop: "1rem" }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.25rem",
              backgroundColor: "#0D9488",
              color: "white",
              border: "none",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
