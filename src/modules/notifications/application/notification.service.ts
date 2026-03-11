import { NotificationChannel } from "@prisma/client";

import { NotificationValidationError } from "@/src/modules/notifications/domain/notification.errors";
import {
  DispatchAppointmentReminder24hInput,
  DispatchAppointmentReminder24hResult,
  ListNotificationsFilters,
  PublicNotification,
} from "@/src/modules/notifications/domain/notification.types";
import { NotificationRepository } from "@/src/modules/notifications/infrastructure/notification.repository";

function formatAppointmentDate(date: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function buildCustomerName(input: { nombres: string; apellidos: string | null }): string {
  return `${input.nombres} ${input.apellidos ?? ""}`.trim();
}

export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async listNotifications(filters: ListNotificationsFilters): Promise<PublicNotification[]> {
    return this.notificationRepository.list(filters);
  }

  async dispatchAppointmentReminder24h(
    input: DispatchAppointmentReminder24hInput
  ): Promise<DispatchAppointmentReminder24hResult> {
    if (input.channel === NotificationChannel.INTERNO) {
      throw new NotificationValidationError(
        "Reminder 24h should be sent via EMAIL or WHATSAPP"
      );
    }

    const now = new Date();
    const windowFrom = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const windowTo = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const eligibleAppointments =
      await this.notificationRepository.findEligibleAppointmentsFor24hReminder({
        from: windowFrom,
        to: windowTo,
      });

    if (input.dryRun) {
      return {
        checked: eligibleAppointments.length,
        eligible: eligibleAppointments.length,
        sent: 0,
        skippedAlreadySent: 0,
        dryRun: true,
      };
    }

    let sent = 0;
    let skippedAlreadySent = 0;

    for (const appointment of eligibleAppointments) {
      const customerName = buildCustomerName({
        nombres: appointment.customer.nombres,
        apellidos: appointment.customer.apellidos,
      });

      const subject = "Recordatorio de cita (24h antes)";
      const message = `Hola ${customerName}, te recordamos tu cita ${appointment.code} para ${formatAppointmentDate(
        appointment.scheduledAt
      )}.`;

      const marked = await this.notificationRepository.markReminderAndCreateNotification({
        appointmentId: appointment.id,
        customerId: appointment.customerId,
        channel: input.channel,
        subject,
        message,
        relatedCode: appointment.code,
        now,
      });

      if (marked) {
        sent += 1;
      } else {
        skippedAlreadySent += 1;
      }
    }

    return {
      checked: eligibleAppointments.length,
      eligible: eligibleAppointments.length,
      sent,
      skippedAlreadySent,
      dryRun: false,
    };
  }
}

export const notificationService = new NotificationService(
  new NotificationRepository()
);
