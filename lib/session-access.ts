import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export type SessionAccess = {
  session: AuthSession;
  isAdmin: boolean;
  isCustomer: boolean;
  customerId: string | null;
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
      customerId: null,
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
          id: true,
          isActive: true,
        },
      },
    },
  });

  const isAdmin = Boolean(memberships?.adminProfile?.isActive);
  const isCustomer = Boolean(memberships?.customer?.isActive);
  const customerId = memberships?.customer?.id ?? null;

  return {
    session,
    isAdmin,
    isCustomer,
    customerId,
    redirectTo: isAdmin ? "/admin" : "/profile",
  };
}

