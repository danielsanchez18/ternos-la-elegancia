import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { getAdminDashboardMetrics } from "@/lib/admin-dashboard-metrics";

export async function GET(request: Request) {
  const auth = await requireApiAuth(request, "admin");

  if (!auth.ok) {
    return auth.response;
  }

  const metrics = await getAdminDashboardMetrics();
  return NextResponse.json(metrics);
}
