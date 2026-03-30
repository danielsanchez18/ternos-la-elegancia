"use client";

import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { useEffect, useMemo } from "react";

import "@schedule-x/theme-default/dist/index.css";
import "@/styles/calendar-custom.css"; // We'll create this for some dark mode refinements if needed

interface AppointmentEvent {
  id: string;
  code: string;
  customerName: string;
  type: string;
  status: string;
  scheduledAt: Date | string;
}

interface AdminAppointmentCalendarProps {
  appointments: AppointmentEvent[];
}

export default function AdminAppointmentCalendar({
  appointments,
}: AdminAppointmentCalendarProps) {
  const eventsService = useMemo(() => createEventsServicePlugin(), []);

  const themeClasses: Record<string, string> = {
    PENDIENTE: "sx-event-amber",
    CONFIRMADA: "sx-event-emerald",
    REALIZADA: "sx-event-sky",
    CANCELADA: "sx-event-rose",
    NO_ASISTIO: "sx-event-orange",
    REPROGRAMADA: "sx-event-violet",
  };

  const calendarEvents = useMemo(() => {
    return appointments.map((a) => {
      const start = new Date(a.scheduledAt);
      const end = new Date(start.getTime() + 30 * 60 * 1000);

      const formatDate = (d: Date) => {
        const YYYY = d.getFullYear();
        const MM = String(d.getMonth() + 1).padStart(2, "0");
        const DD = String(d.getDate()).padStart(2, "0");
        const HH = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${YYYY}-${MM}-${DD} ${HH}:${mm}`;
      };

      return {
        id: a.id,
        title: `${a.customerName} (${a.code})`,
        start: formatDate(start),
        end: formatDate(end),
        description: `${a.type.replaceAll("_", " ")} - ${a.status}`,
        classes: [themeClasses[a.status] || ""],
        _raw: a,
      };
    });
  }, [appointments]);

  const calendar = useCalendarApp({
    views: [
      createViewWeek(),
      createViewDay(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    events: calendarEvents,
    plugins: [eventsService],
    locale: "es-ES",
    firstDayOfWeek: 1, // Lunes
    defaultView: "week",
    isDark: true,
    weekOptions: {
      gridHeight: 2000,
      gridStep: 30,
      timeAxisFormatOptions: { hour: "2-digit", minute: "2-digit" },
    },
    dayBoundaries: {
      start: "08:00",
      end: "20:00",
    },
  });

  return (
    <div className="sx-react-calendar-wrapper h-[700px] w-full overflow-hidden rounded-[2rem] border border-white/8 bg-black/20 p-2">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}
