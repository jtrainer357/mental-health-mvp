/**
 * API v1: Health check endpoint
 * GET /api/v1/health - Check API and service health
 */

import { NextRequest, NextResponse } from "next/server";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    name: string;
    status: "pass" | "fail" | "warn";
    message?: string;
    duration?: number;
  }[];
}

// Track server start time for uptime calculation
const startTime = Date.now();

export async function GET(_request: NextRequest) {
  const checks: HealthCheck["checks"] = [];
  let overallStatus: HealthCheck["status"] = "healthy";

  // Check 1: Memory usage
  const memoryCheck = checkMemory();
  checks.push(memoryCheck);
  if (memoryCheck.status === "fail") {
    overallStatus = "unhealthy";
  } else if (memoryCheck.status === "warn" && overallStatus === "healthy") {
    overallStatus = "degraded";
  }

  // Check 2: Database connectivity (mock)
  const dbCheck = await checkDatabase();
  checks.push(dbCheck);
  if (dbCheck.status === "fail") {
    overallStatus = "unhealthy";
  } else if (dbCheck.status === "warn" && overallStatus === "healthy") {
    overallStatus = "degraded";
  }

  // Check 3: External services (mock)
  const externalCheck = checkExternalServices();
  checks.push(externalCheck);
  if (externalCheck.status === "warn" && overallStatus === "healthy") {
    overallStatus = "degraded";
  }

  const health: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

function checkMemory(): HealthCheck["checks"][0] {
  const startMs = performance.now();

  // In Node.js, we can use process.memoryUsage()
  // This is a simplified check
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const usagePercent = (used.heapUsed / used.heapTotal) * 100;

  const duration = Math.round(performance.now() - startMs);

  if (usagePercent > 90) {
    return {
      name: "memory",
      status: "fail",
      message: `Heap usage critical: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`,
      duration,
    };
  }

  if (usagePercent > 75) {
    return {
      name: "memory",
      status: "warn",
      message: `Heap usage high: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`,
      duration,
    };
  }

  return {
    name: "memory",
    status: "pass",
    message: `Heap usage normal: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`,
    duration,
  };
}

async function checkDatabase(): Promise<HealthCheck["checks"][0]> {
  const startMs = performance.now();

  try {
    // Mock database check - in production, run a simple query
    // await supabase.from('health_check').select('1').limit(1);
    await new Promise((resolve) => setTimeout(resolve, 5));

    const duration = Math.round(performance.now() - startMs);

    return {
      name: "database",
      status: "pass",
      message: "Database connection healthy",
      duration,
    };
  } catch (error) {
    const duration = Math.round(performance.now() - startMs);
    const message = error instanceof Error ? error.message : "Unknown error";

    return {
      name: "database",
      status: "fail",
      message: `Database connection failed: ${message}`,
      duration,
    };
  }
}

function checkExternalServices(): HealthCheck["checks"][0] {
  const startMs = performance.now();

  // Mock external service check
  // In production, check AI providers, email service, etc.
  const duration = Math.round(performance.now() - startMs);

  return {
    name: "external_services",
    status: "pass",
    message: "All external services operational",
    duration,
  };
}
