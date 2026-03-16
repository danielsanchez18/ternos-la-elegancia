import { NextResponse } from "next/server";

import { getSessionAccess } from "@/lib/session-access";

export async function GET(request: Request) {
  const access = await getSessionAccess(request.headers);

  return NextResponse.json({
    authenticated: Boolean(access.session),
    isAdmin: access.isAdmin,
    isCustomer: access.isCustomer,
    redirectTo: access.redirectTo,
  });
}
