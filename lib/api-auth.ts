import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRouteAccessPolicy } from "@/src/security/api-access-map";

export type ApiAuthLevel = "authenticated" | "admin" | "customer";

export type ApiAuthContext = {
  userId: string;
  adminUserId: number | null;
  customerId: number | null;
};

type ApiAuthSuccess = {
  ok: true;
  context: ApiAuthContext;
};

type ApiAuthFailure = {
  ok: false;
  response: NextResponse;
};

export type ApiAuthResult = ApiAuthSuccess | ApiAuthFailure;

type ApiAccessLevel = ApiAuthLevel | "public";

function mergeAccessLevels(
  requestedLevel: ApiAuthLevel,
  policyLevel: ApiAccessLevel | null
): ApiAuthLevel {
  if (!policyLevel || policyLevel === "public") {
    return requestedLevel;
  }

  if (requestedLevel === "admin" || policyLevel === "admin") {
    return "admin";
  }

  if (requestedLevel === "customer" || policyLevel === "customer") {
    return "customer";
  }

  return "authenticated";
}

export async function requireApiAuth(
  request: Request,
  level: ApiAuthLevel = "authenticated"
): Promise<ApiAuthResult> {
  const pathname = new URL(request.url).pathname;
  const policyLevel = getRouteAccessPolicy(pathname)?.level ?? null;
  const effectiveLevel = mergeAccessLevels(level, policyLevel);

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const memberships = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      adminProfile: {
        select: {
          id: true,
          isActive: true,
        },
      },
      customer: {
        select: {
          id: true,
          isActive: true,
        },
      },
    },
  });

  const context: ApiAuthContext = {
    userId: session.user.id,
    adminUserId: memberships?.adminProfile?.id ?? null,
    customerId: memberships?.customer?.id ?? null,
  };

  if (effectiveLevel === "authenticated") {
    return { ok: true, context };
  }

  if (effectiveLevel === "admin") {
    if (!memberships?.adminProfile || !memberships.adminProfile.isActive) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }

    return { ok: true, context };
  }

  if (!memberships?.customer || !memberships.customer.isActive) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, context };
}
