import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { prisma } from "@/lib/prisma";

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

export async function requireApiAuth(
  request: Request,
  level: ApiAuthLevel = "authenticated"
): Promise<ApiAuthResult> {
  const token = getSessionCookie(request.headers);

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const session = await prisma.session.findUnique({
    where: { token },
    select: {
      userId: true,
      expiresAt: true,
      user: {
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
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const context: ApiAuthContext = {
    userId: session.userId,
    adminUserId: session.user.adminProfile?.id ?? null,
    customerId: session.user.customer?.id ?? null,
  };

  if (level === "authenticated") {
    return { ok: true, context };
  }

  if (level === "admin") {
    if (!session.user.adminProfile || !session.user.adminProfile.isActive) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }

    return { ok: true, context };
  }

  if (!session.user.customer || !session.user.customer.isActive) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, context };
}
