import { NotificationChannel, NotificationStatus } from "@prisma/client";

export type PublicNotification = {
  id: string;
  customerId: string | null;
  channel: NotificationChannel;
  status: NotificationStatus;
  subject: string | null;
  message: string;
  sentAt: Date | null;
  relatedCode: string | null;
  createdAt: Date;
};

export type ListNotificationsFilters = {
  customerId?: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  from?: Date;
  to?: Date;
};

export type DispatchAppointmentReminder24hInput = {
  channel: NotificationChannel;
  dryRun?: boolean;
};

export type DispatchAppointmentReminder24hResult = {
  checked: number;
  eligible: number;
  sent: number;
  skippedAlreadySent: number;
  dryRun: boolean;
};
