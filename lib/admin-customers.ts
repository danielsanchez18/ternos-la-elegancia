import { NotificationChannel, NotificationStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isUuidLike } from "@/src/security/public-id";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function fullName(input: { nombres: string; apellidos: string | null }) {
  return `${input.nombres} ${input.apellidos ?? ""}`.trim();
}

function toOrderCount(input: {
  saleOrders: number;
  customOrders: number;
  rentalOrders: number;
  alterationOrders: number;
}) {
  return (
    input.saleOrders +
    input.customOrders +
    input.rentalOrders +
    input.alterationOrders
  );
}

type CustomerRecentOverviewSource = {
  id: string;
  nombres: string;
  apellidos: string | null;
  email: string;
  celular: string | null;
  dni: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    appointments: number;
    saleOrders: number;
    customOrders: number;
    rentalOrders: number;
    alterationOrders: number;
    measurementProfiles: number;
    notes: number;
    files: number;
    notifications: number;
  };
  measurementProfiles: Array<{ validUntil: Date }>;
  appointments: Array<{ scheduledAt: Date; status: string }>;
};

type UpcomingAppointmentSource = {
  id: string;
  code: string;
  type: string;
  status: string;
  scheduledAt: Date;
  customer: {
    nombres: string;
    apellidos: string | null;
  };
};

type CustomerListSource = {
  id: string;
  nombres: string;
  apellidos: string | null;
  email: string;
  celular: string | null;
  dni: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    appointments: number;
    saleOrders: number;
    customOrders: number;
    rentalOrders: number;
    alterationOrders: number;
    measurementProfiles: number;
    notes: number;
    files: number;
  };
  measurementProfiles: Array<{ validUntil: Date }>;
  appointments: Array<{ scheduledAt: Date; status: string }>;
};

type RecentMeasurementProfileSource = {
  id: string;
  takenAt: Date;
  validUntil: Date;
  notes: string | null;
  isActive: boolean;
  customer: {
    id: string;
    nombres: string;
    apellidos: string | null;
  };
  garments: Array<{
    id: string;
    garmentType: string;
    values: Array<{ id: string }>;
  }>;
};

type RecentCustomerNoteSource = {
  id: string;
  note: string;
  createdAt: Date;
  customer: {
    id: string;
    nombres: string;
    apellidos: string | null;
  };
  adminUser: {
    nombres: string;
    apellidos: string | null;
    email: string;
  } | null;
};

type RecentCustomerFileSource = {
  id: string;
  fileName: string;
  mimeType: string | null;
  description: string | null;
  fileUrl: string;
  createdAt: Date;
  customer: {
    id: string;
    nombres: string;
    apellidos: string | null;
  };
};

type RecentNotificationSource = {
  id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  subject: string | null;
  message: string;
  sentAt: Date | null;
  relatedCode: string | null;
  createdAt: Date;
  customer: {
    id: string;
    nombres: string;
    apellidos: string | null;
  } | null;
};

type NumericLike = number | string | bigint | Prisma.Decimal | null | undefined;

type MeasurementGarmentSource = {
  id: string;
  garmentType: string;
  values: Array<{
    id: string;
    field: {
      label: string;
      code: string;
    };
    valueNumber: NumericLike;
  }>;
};

function mapRecentCustomerOverview(customer: CustomerRecentOverviewSource) {
  return {
    id: customer.id,
    fullName: fullName(customer),
    email: customer.email,
    celular: customer.celular,
    dni: customer.dni,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    orderCount: toOrderCount(customer._count),
    appointmentCount: customer._count.appointments,
    measurementProfileCount: customer._count.measurementProfiles,
    notesCount: customer._count.notes,
    filesCount: customer._count.files,
    notificationsCount: customer._count.notifications,
    validMeasurementUntil: customer.measurementProfiles[0]?.validUntil ?? null,
    nextAppointmentAt: customer.appointments[0]?.scheduledAt ?? null,
    nextAppointmentStatus: customer.appointments[0]?.status ?? null,
  };
}

function mapUpcomingAppointment(appointment: UpcomingAppointmentSource) {
  return {
    id: appointment.id,
    code: appointment.code,
    type: appointment.type,
    status: appointment.status,
    scheduledAt: appointment.scheduledAt,
    customerName: fullName(appointment.customer),
  };
}

function mapCustomerListItem(customer: CustomerListSource) {
  return {
    id: customer.id,
    fullName: fullName(customer),
    nombres: customer.nombres,
    apellidos: customer.apellidos,
    email: customer.email,
    celular: customer.celular,
    dni: customer.dni,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    orderCount: toOrderCount(customer._count),
    appointmentCount: customer._count.appointments,
    profileCount: customer._count.measurementProfiles,
    notesCount: customer._count.notes,
    filesCount: customer._count.files,
    validMeasurementUntil: customer.measurementProfiles[0]?.validUntil ?? null,
    lastAppointmentAt: customer.appointments[0]?.scheduledAt ?? null,
    lastAppointmentStatus: customer.appointments[0]?.status ?? null,
  };
}

function mapRecentMeasurementProfile(profile: RecentMeasurementProfileSource) {
  return {
    id: profile.id,
    customerId: profile.customer.id,
    customerName: fullName(profile.customer),
    takenAt: profile.takenAt,
    validUntil: profile.validUntil,
    notes: profile.notes,
    isActive: profile.isActive,
    garmentCount: profile.garments.length,
    valueCount: profile.garments.reduce(
      (total, garment) => total + garment.values.length,
      0
    ),
    garments: profile.garments.map((garment) => garment.garmentType),
  };
}

function mapRecentNote(note: RecentCustomerNoteSource) {
  return {
    id: note.id,
    note: note.note,
    createdAt: note.createdAt,
    customerId: note.customer.id,
    customerName: fullName(note.customer),
    adminName: note.adminUser ? fullName(note.adminUser) : "Sin responsable",
    adminEmail: note.adminUser?.email ?? null,
  };
}

function mapRecentFile(file: RecentCustomerFileSource) {
  return {
    id: file.id,
    fileName: file.fileName,
    mimeType: file.mimeType,
    description: file.description,
    fileUrl: file.fileUrl,
    createdAt: file.createdAt,
    customerId: file.customer.id,
    customerName: fullName(file.customer),
  };
}

function mapRecentNotification(notification: RecentNotificationSource) {
  return {
    id: notification.id,
    channel: notification.channel,
    status: notification.status,
    subject: notification.subject,
    message: notification.message,
    sentAt: notification.sentAt,
    relatedCode: notification.relatedCode,
    createdAt: notification.createdAt,
    customerId: notification.customer?.id ?? null,
    customerName: notification.customer
      ? fullName(notification.customer)
      : "Operacion interna",
  };
}

function mapOrderWithNumericTotal<T extends { total: NumericLike }>(order: T) {
  return {
    ...order,
    total: Number(order.total),
  };
}

function mapMeasurementGarmentForView(garment: MeasurementGarmentSource) {
  return {
    ...garment,
    values: garment.values.map((value) => ({
      id: value.id,
      definition: value.field,
      value: Number(value.valueNumber || 0),
    })),
  };
}

async function resolveCustomerId(customerId: string): Promise<string | null> {
  const normalizedId = customerId.trim().toLowerCase();
  if (!isUuidLike(normalizedId)) {
    return null;
  }

  return normalizedId;
}

export async function getAdminCustomersOverviewData() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const nextThirtyDays = addDays(now, 30);
  const validMeasurementWhere = {
    isActive: true,
    validUntil: {
      gte: now,
    },
  };

  const [
    totalCustomers,
    activeCustomers,
    newCustomersThisMonth,
    customersWithValidMeasurements,
    customersWithoutValidMeasurements,
    totalNotes,
    totalFiles,
    pendingNotifications,
    recentCustomers,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({
      where: {
        isActive: true,
      },
    }),
    prisma.customer.count({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.customer.count({
      where: {
        measurementProfiles: {
          some: validMeasurementWhere,
        },
      },
    }),
    prisma.customer.count({
      where: {
        measurementProfiles: {
          none: validMeasurementWhere,
        },
      },
    }),
    prisma.customerNote.count(),
    prisma.customerFile.count(),
    prisma.notification.count({
      where: {
        status: NotificationStatus.PENDIENTE,
      },
    }),
    prisma.customer.findMany({
      take: 6,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        celular: true,
        dni: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            appointments: true,
            saleOrders: true,
            customOrders: true,
            rentalOrders: true,
            alterationOrders: true,
            measurementProfiles: true,
            notes: true,
            files: true,
            notifications: true,
          },
        },
        measurementProfiles: {
          where: validMeasurementWhere,
          orderBy: {
            validUntil: "desc",
          },
          take: 1,
          select: {
            validUntil: true,
          },
        },
        appointments: {
          where: {
            scheduledAt: {
              gte: now,
              lte: nextThirtyDays,
            },
          },
          orderBy: {
            scheduledAt: "asc",
          },
          take: 1,
          select: {
            scheduledAt: true,
            status: true,
          },
        },
      },
    }),
    prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: now,
          lte: nextThirtyDays,
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
      take: 6,
      select: {
        id: true,
        code: true,
        type: true,
        status: true,
        scheduledAt: true,
        customer: {
          select: {
            nombres: true,
            apellidos: true,
          },
        },
      },
    }),
  ]);

  return {
    summary: {
      totalCustomers,
      activeCustomers,
      inactiveCustomers: totalCustomers - activeCustomers,
      newCustomersThisMonth,
      customersWithValidMeasurements,
      customersWithoutValidMeasurements,
      totalNotes,
      totalFiles,
      pendingNotifications,
    },
    recentCustomers: recentCustomers.map(mapRecentCustomerOverview),
    upcomingAppointments: upcomingAppointments.map(mapUpcomingAppointment),
  };
}

export async function getAdminCustomersListData() {
  const now = new Date();
  const validMeasurementWhere = {
    isActive: true,
    validUntil: {
      gte: now,
    },
  };

  const customers = await prisma.customer.findMany({
    take: 40,
    orderBy: [
      {
        isActive: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      email: true,
      celular: true,
      dni: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          appointments: true,
          saleOrders: true,
          customOrders: true,
          rentalOrders: true,
          alterationOrders: true,
          measurementProfiles: true,
          notes: true,
          files: true,
        },
      },
      measurementProfiles: {
        where: validMeasurementWhere,
        orderBy: {
          validUntil: "desc",
        },
        take: 1,
        select: {
          validUntil: true,
        },
      },
      appointments: {
        orderBy: {
          scheduledAt: "desc",
        },
        take: 1,
        select: {
          scheduledAt: true,
          status: true,
        },
      },
    },
  });

  return customers.map(mapCustomerListItem);
}

export async function getAdminCustomersMeasurementsData() {
  const now = new Date();
  const nextThirtyDays = addDays(now, 30);

  const [
    totalProfiles,
    activeProfiles,
    expiringProfiles,
    customersWithoutProfiles,
    customersWithoutValidProfiles,
    recentProfiles,
  ] = await Promise.all([
    prisma.measurementProfile.count(),
    prisma.measurementProfile.count({
      where: {
        isActive: true,
      },
    }),
    prisma.measurementProfile.count({
      where: {
        isActive: true,
        validUntil: {
          gte: startOfDay(now),
          lte: nextThirtyDays,
        },
      },
    }),
    prisma.customer.count({
      where: {
        measurementProfiles: {
          none: {},
        },
      },
    }),
    prisma.customer.count({
      where: {
        measurementProfiles: {
          none: {
            isActive: true,
            validUntil: {
              gte: now,
            },
          },
        },
      },
    }),
    prisma.measurementProfile.findMany({
      take: 12,
      orderBy: {
        takenAt: "desc",
      },
      select: {
        id: true,
        takenAt: true,
        validUntil: true,
        notes: true,
        isActive: true,
        customer: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        garments: {
          select: {
            id: true,
            garmentType: true,
            values: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    summary: {
      totalProfiles,
      activeProfiles,
      inactiveProfiles: totalProfiles - activeProfiles,
      expiringProfiles,
      customersWithoutProfiles,
      customersWithoutValidProfiles,
    },
    recentProfiles: recentProfiles.map(mapRecentMeasurementProfile),
  };
}

export async function getAdminCustomersRecordsData() {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [
    totalNotes,
    notesThisMonth,
    customersWithNotes,
    totalFiles,
    filesThisMonth,
    customersWithFiles,
    recentNotes,
    recentFiles,
  ] = await Promise.all([
    prisma.customerNote.count(),
    prisma.customerNote.count({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.customer.count({
      where: {
        notes: {
          some: {},
        },
      },
    }),
    prisma.customerFile.count(),
    prisma.customerFile.count({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.customer.count({
      where: {
        files: {
          some: {},
        },
      },
    }),
    prisma.customerNote.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        note: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        adminUser: {
          select: {
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
      },
    }),
    prisma.customerFile.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        description: true,
        fileUrl: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    }),
  ]);

  return {
    summary: {
      totalNotes,
      notesThisMonth,
      customersWithNotes,
      totalFiles,
      filesThisMonth,
      customersWithFiles,
    },
    recentNotes: recentNotes.map(mapRecentNote),
    recentFiles: recentFiles.map(mapRecentFile),
  };
}

export async function getAdminCustomersCommunicationsData() {
  const [
    totalNotifications,
    pendingNotifications,
    sentNotifications,
    failedNotifications,
    emailNotifications,
    whatsappNotifications,
    internalNotifications,
    recentNotifications,
  ] = await Promise.all([
    prisma.notification.count(),
    prisma.notification.count({
      where: {
        status: NotificationStatus.PENDIENTE,
      },
    }),
    prisma.notification.count({
      where: {
        status: NotificationStatus.ENVIADA,
      },
    }),
    prisma.notification.count({
      where: {
        status: NotificationStatus.FALLIDA,
      },
    }),
    prisma.notification.count({
      where: {
        channel: NotificationChannel.EMAIL,
      },
    }),
    prisma.notification.count({
      where: {
        channel: NotificationChannel.WHATSAPP,
      },
    }),
    prisma.notification.count({
      where: {
        channel: NotificationChannel.INTERNO,
      },
    }),
    prisma.notification.findMany({
      take: 12,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        channel: true,
        status: true,
        subject: true,
        message: true,
        sentAt: true,
        relatedCode: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    }),
  ]);

  return {
    summary: {
      totalNotifications,
      pendingNotifications,
      sentNotifications,
      failedNotifications,
      emailNotifications,
      whatsappNotifications,
      internalNotifications,
    },
    recentNotifications: recentNotifications.map(mapRecentNotification),
  };
}

export async function getAdminCustomerDetail(idOrPublicId: string) {
  const id = await resolveCustomerId(idOrPublicId);
  if (!id) {
    return null;
  }

  const customer = await prisma.customer.findUnique({
    where: { id },
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      email: true,
      celular: true,
      dni: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      appointments: {
        orderBy: { scheduledAt: "desc" },
        take: 5,
        select: {
          id: true,
          code: true,
          type: true,
          status: true,
          scheduledAt: true,
        },
      },
      saleOrders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          code: true,
          status: true,
          total: true,
          createdAt: true,
        },
      },
      customOrders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          code: true,
          status: true,
          total: true,
          createdAt: true,
        },
      },
      measurementProfiles: {
        orderBy: { takenAt: "desc" },
        take: 3,
        select: {
          id: true,
          takenAt: true,
          validUntil: true,
          isActive: true,
        },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          note: true,
          createdAt: true,
          adminUser: {
            select: { nombres: true, apellidos: true },
          },
        },
      },
    },
  });

  if (!customer) return null;

  return {
    ...customer,
    fullName: `${customer.nombres} ${customer.apellidos ?? ""}`.trim(),
    saleOrders: customer.saleOrders.map(mapOrderWithNumericTotal),
    customOrders: customer.customOrders.map(mapOrderWithNumericTotal),
  };
}

export async function getAdminCustomerMeasurements(customerIdOrPublicId: string) {
  const customerId = await resolveCustomerId(customerIdOrPublicId);
  if (!customerId) {
    return {
      customerId: null,
      customerName: "",
      profiles: [],
    };
  }

  const profiles = await prisma.measurementProfile.findMany({
    where: { customerId },
    orderBy: { takenAt: "desc" },
    select: {
      id: true,
      takenAt: true,
      validUntil: true,
      notes: true,
      isActive: true,
      garments: {
        select: {
          id: true,
          garmentType: true,
          values: {
            select: {
              id: true,
              field: {
                select: { label: true, code: true },
              },
              valueNumber: true,
            },
          },
        },
      },
    },
  });

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { nombres: true, apellidos: true },
  });

  return {
    customerId,
    customerName: customer ? `${customer.nombres} ${customer.apellidos ?? ""}`.trim() : "Cliente desconocido",
    profiles: profiles.map((profile) => ({
      ...profile,
      garments: profile.garments.map(mapMeasurementGarmentForView),
    })),
  };
}
