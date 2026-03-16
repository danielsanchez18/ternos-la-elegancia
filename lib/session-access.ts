import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export type SessionAccess = {
  session: AuthSession;
  isAdmin: boolean;
  isCustomer: boolean;
  redirectTo: "/ingresa" | "/profile" | "/admin";
};

export async function getSessionAccess(
  requestHeaders: Headers
): Promise<SessionAccess> {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    return {
      session: null,
      isAdmin: false,
      isCustomer: false,
      redirectTo: "/ingresa",
    };
  }

  const memberships = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      adminProfile: {
        select: {
          isActive: true,
        },
      },
      customer: {
        select: {
          isActive: true,
        },
      },
    },
  });

  const isAdmin = Boolean(memberships?.adminProfile?.isActive);
  const isCustomer = Boolean(memberships?.customer?.isActive);

  return {
    session,
    isAdmin,
    isCustomer,
    redirectTo: isAdmin ? "/admin" : "/profile",
  };
}
