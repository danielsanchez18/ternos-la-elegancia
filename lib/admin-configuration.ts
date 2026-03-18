import { prisma } from "@/lib/prisma";
import { appointmentService } from "@/src/modules/appointments/application/appointment.service";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function fullName(input: { nombres: string; apellidos: string | null }) {
  return `${input.nombres} ${input.apellidos ?? ""}`.trim();
}

export const weekdayLabels = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

export async function getAdminConfigurationOverviewData() {
  const now = new Date();
  const today = startOfDay(now);

  const [
    totalAdmins,
    activeAdmins,
    adminsLinkedToAuth,
    totalUsers,
    verifiedUsers,
    activeSessions,
    customerAccountsLinked,
    recentAdmins,
    businessHours,
    upcomingSpecialSchedules,
  ] = await Promise.all([
    prisma.adminUser.count(),
    prisma.adminUser.count({
      where: {
        isActive: true,
      },
    }),
    prisma.adminUser.count({
      where: {
        authUserId: {
          not: null,
        },
      },
    }),
    prisma.user.count(),
    prisma.user.count({
      where: {
        emailVerified: true,
      },
    }),
    prisma.session.count({
      where: {
        expiresAt: {
          gt: now,
        },
      },
    }),
    prisma.customer.count({
      where: {
        authUserId: {
          not: null,
        },
      },
    }),
    prisma.adminUser.findMany({
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        isActive: true,
        createdAt: true,
        authUserId: true,
        authUser: {
          select: {
            emailVerified: true,
          },
        },
      },
    }),
    appointmentService.listBusinessHours(),
    appointmentService.listSpecialSchedules({
      from: today,
      to: addDays(today, 45),
    }),
  ]);

  return {
    summary: {
      totalAdmins,
      activeAdmins,
      inactiveAdmins: totalAdmins - activeAdmins,
      adminsLinkedToAuth,
      totalUsers,
      verifiedUsers,
      activeSessions,
      customerAccountsLinked,
      openDays: businessHours.filter((item) => !item.isClosed).length,
      closedDays: businessHours.filter((item) => item.isClosed).length,
      upcomingSpecialSchedules: upcomingSpecialSchedules.length,
    },
    recentAdmins: recentAdmins.map((admin) => ({
      id: admin.id,
      fullName: fullName(admin),
      email: admin.email,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      hasAuthLink: Boolean(admin.authUserId),
      emailVerified: admin.authUser?.emailVerified ?? false,
    })),
    businessHours,
    upcomingSpecialSchedules,
  };
}

export async function getAdminConfigurationUsersData() {
  const [adminUsers, authUsers] = await Promise.all([
    prisma.adminUser.findMany({
      orderBy: [
        {
          isActive: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        isActive: true,
        createdAt: true,
        authUserId: true,
        authUser: {
          select: {
            emailVerified: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      take: 12,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
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
    }),
  ]);

  return {
    summary: {
      totalAdmins: adminUsers.length,
      activeAdmins: adminUsers.filter((item) => item.isActive).length,
      adminsWithoutAuth: adminUsers.filter((item) => !item.authUserId).length,
      verifiedAuthUsers: authUsers.filter((item) => item.emailVerified).length,
      customerUsers: authUsers.filter((item) => Boolean(item.customer)).length,
    },
    adminUsers: adminUsers.map((admin) => ({
      id: admin.id,
      fullName: fullName(admin),
      email: admin.email,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      hasAuthLink: Boolean(admin.authUserId),
      emailVerified: admin.authUser?.emailVerified ?? false,
      authCreatedAt: admin.authUser?.createdAt ?? null,
    })),
    authUsers: authUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      isAdmin: Boolean(user.adminProfile),
      adminActive: user.adminProfile?.isActive ?? false,
      isCustomer: Boolean(user.customer),
      customerActive: user.customer?.isActive ?? false,
    })),
  };
}

export async function getAdminConfigurationAvailabilityData() {
  const today = startOfDay(new Date());
  const [businessHours, specialSchedules] = await Promise.all([
    appointmentService.listBusinessHours(),
    appointmentService.listSpecialSchedules({
      from: today,
      to: addDays(today, 60),
    }),
  ]);

  return {
    summary: {
      openDays: businessHours.filter((item) => !item.isClosed).length,
      closedDays: businessHours.filter((item) => item.isClosed).length,
      specialSchedules: specialSchedules.length,
      closures: specialSchedules.filter((item) => item.isClosed).length,
    },
    businessHours,
    specialSchedules,
  };
}

export async function getAdminConfigurationSystemData() {
  const now = new Date();

  const [
    totalUsers,
    verifiedUsers,
    activeSessions,
    linkedAdminAccounts,
    linkedCustomerAccounts,
    recentSessions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        emailVerified: true,
      },
    }),
    prisma.session.count({
      where: {
        expiresAt: {
          gt: now,
        },
      },
    }),
    prisma.adminUser.count({
      where: {
        authUserId: {
          not: null,
        },
      },
    }),
    prisma.customer.count({
      where: {
        authUserId: {
          not: null,
        },
      },
    }),
    prisma.session.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return {
    summary: {
      totalUsers,
      verifiedUsers,
      activeSessions,
      linkedAdminAccounts,
      linkedCustomerAccounts,
    },
    readiness: [
      {
        label: "Base de datos",
        isReady: Boolean(process.env.DATABASE_URL),
        detail: "Conexion principal hacia Prisma/PostgreSQL.",
      },
      {
        label: "Better Auth URL",
        isReady: Boolean(process.env.BETTER_AUTH_URL),
        detail: "URL base usada para callbacks y sesion.",
      },
      {
        label: "Better Auth secret",
        isReady: Boolean(process.env.BETTER_AUTH_SECRET),
        detail: "Secreto requerido para firmas y proteccion de sesion.",
      },
      {
        label: "Cron interno",
        isReady: Boolean(process.env.CRON_SECRET),
        detail: "Habilita ejecucion segura de jobs internos.",
      },
    ],
    recentSessions: recentSessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      userName: session.user.name,
      userEmail: session.user.email,
    })),
  };
}
