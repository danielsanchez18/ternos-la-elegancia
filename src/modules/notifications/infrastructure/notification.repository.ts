import {
  AppointmentStatus,
  NotificationChannel,
  NotificationStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  ListNotificationsFilters,
  PublicNotification,
} from "@/src/modules/notifications/domain/notification.types";

const publicNotificationSelect = {
  id: true,
  customerId: true,
  channel: true,
  status: true,
  subject: true,
  message: true,
  sentAt: true,
  relatedCode: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

export class NotificationRepository {
  async list(filters: ListNotificationsFilters): Promise<PublicNotification[]> {
    return prisma.notification.findMany({
      where: {
        customerId: filters.customerId,
        channel: filters.channel,
        status: filters.status,
        createdAt:
          filters.from || filters.to
            ? {
                gte: filters.from,
                lte: filters.to,
              }
            : undefined,
      },
      orderBy: { createdAt: "desc" },
      select: publicNotificationSelect,
    });
  }

  async countReminderCandidatesFor24hReminder(input: {
    from: Date;
    to: Date;
  }): Promise<number> {
    return prisma.appointment.count({
      where: {
        status: {
          in: [
            AppointmentStatus.PENDIENTE,
            AppointmentStatus.CONFIRMADA,
            AppointmentStatus.REPROGRAMADA,
          ],
        },
        scheduledAt: {
          gte: input.from,
          lte: input.to,
        },
      },
    });
  }

  async findEligibleAppointmentsFor24hReminder(input: {
    from: Date;
    to: Date;
  }) {
    return prisma.appointment.findMany({
      where: {
        reminder24hSentAt: null,
        status: {
          in: [
            AppointmentStatus.PENDIENTE,
            AppointmentStatus.CONFIRMADA,
            AppointmentStatus.REPROGRAMADA,
          ],
        },
        scheduledAt: {
          gte: input.from,
          lte: input.to,
        },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        code: true,
        customerId: true,
        type: true,
        scheduledAt: true,
        customer: {
          select: {
            nombres: true,
            apellidos: true,
            celular: true,
            email: true,
          },
        },
      },
    });
  }

  async markReminderAndCreateNotification(input: {
    appointmentId: string;
    customerId: string;
    channel: NotificationChannel;
    subject: string;
    message: string;
    relatedCode: string;
    now: Date;
  }): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.updateMany({
        where: {
          id: input.appointmentId,
          reminder24hSentAt: null,
          status: {
            in: [
              AppointmentStatus.PENDIENTE,
              AppointmentStatus.CONFIRMADA,
              AppointmentStatus.REPROGRAMADA,
            ],
          },
        },
        data: {
          reminder24hSentAt: input.now,
        },
      });

      if (updated.count === 0) {
        return false;
      }

      await tx.notification.create({
        data: {
          customerId: input.customerId,
          channel: input.channel,
          status: NotificationStatus.ENVIADA,
          subject: input.subject,
          message: input.message,
          sentAt: input.now,
          relatedCode: input.relatedCode,
        },
      });

      return true;
    });
  }
}
