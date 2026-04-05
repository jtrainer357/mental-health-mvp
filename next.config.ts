/**
 * NEXT.JS CONFIGURATION - Tebra Mental Health MVP
 *
 * IMPORTANT: DUAL DIRECTORY STRUCTURE
 * ====================================
 * This project has TWO app directories. Only `app/` at root is used by Next.js for routing.
 *
 * ACTIVE (Next.js routing):
 *   - app/                   <- All pages and API routes live here
 *   - app/api/               <- Active API routes (28 routes)
 *   - app/home/              <- Home page and sub-routes
 *   - app/patients/          <- Patient routes
 *   - etc.
 *
 * DEAD CODE (NOT used by Next.js):
 *   - src/app/api/           <- Contains 3 duplicate API routes that are UNREACHABLE
 *                               These were from Wave 1 development and should be removed:
 *                               - src/app/api/substrate/actions/route.ts (duplicate)
 *                               - src/app/api/substrate/actions/[id]/route.ts (duplicate)
 *                               - src/app/api/substrate/scan/route.ts (duplicate)
 *
 * IMPORTABLE (works via @/ alias):
 *   - src/components/        <- Reusable React components
 *   - src/lib/               <- Core libraries (auth, AI, substrate, etc.)
 *   - src/hooks/             <- Custom React hooks
 *   - src/types/             <- TypeScript type definitions
 *   - design-system/         <- Design system components
 *   - components/            <- Pre-Wave 1 components
 *   - lib/                   <- Pre-Wave 1 libraries
 *
 * PATH ALIAS:
 *   @/ maps to project root, so:
 *   - @/src/lib/...          <- Import from src/lib
 *   - @/design-system/...    <- Import from design-system
 *   - @/components/...       <- Import from components
 *
 * TODO (Sprint 0):
 *   1. Delete src/app/ directory entirely (it's dead code)
 *   2. Keep all other src/ subdirectories (they're actively imported)
 */

import path from "path";
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Include vault markdown files in serverless function bundle
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  // Disable the Next.js DevTools indicator in the corner
  devIndicators: false,
  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xsgames.co",
        pathname: "/randomusers/**",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
