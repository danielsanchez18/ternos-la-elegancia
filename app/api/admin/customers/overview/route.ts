import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { getAdminCustomersOverviewData } from "@/lib/admin-customers";

export async function GET(request: Request) {
  const auth = await requireApiAuth(request, "admin");

  if (!auth.ok) {
    return auth.response;
  }

  const data = await getAdminCustomersOverviewData();
  return NextResponse.json(data);
}
