import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  KeyRound,
  Settings2,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { weekdayLabels } from "@/lib/admin-configuration";
import { getAdminSection } from "@/lib/admin-dashboard";
import type {
  getAdminConfigurationAvailabilityData,
  getAdminConfigurationOverviewData,
  getAdminConfigurationSystemData,
  getAdminConfigurationUsersData,
} from "@/lib/admin-configuration";

type ConfigurationOverviewData = Awaited<
  ReturnType<typeof getAdminConfigurationOverviewData>
>;
type ConfigurationUsersData = Awaited<
  ReturnType<typeof getAdminConfigurationUsersData>
>;
type ConfigurationAvailabilityData = Awaited<
  ReturnType<typeof getAdminConfigurationAvailabilityData>
>;
type ConfigurationSystemData = Awaited<
  ReturnType<typeof getAdminConfigurationSystemData>
>;

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "short",
  timeStyle: "short",
});

function readinessChip(isReady: boolean) {
  return isReady
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
    : "border-amber-400/20 bg-amber-400/10 text-amber-200";
}

function statCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
      <p className="text-sm font-medium text-stone-200">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone-400">{detail}</p>
    </div>
  );
}

function panel({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function sectionLinks() {
  const section = getAdminSection("configuracion");

  if (!section) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {section.subroutes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
        >
          <p className="text-base font-semibold text-white">{route.label}</p>
          <p className="mt-2 text-sm leading-6 text-stone-400">{route.description}</p>
        </Link>
      ))}
    </div>
  );
}

export function ConfigurationSectionView({
  data,
}: {
  data: ConfigurationOverviewData;
}) {
  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,rgba(18,24,39,0.92),rgba(7,7,7,0.96))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-sky-200">
              Gobierno del sistema
            </span>
            <div className="space-y-3">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Administra accesos internos, disponibilidad operativa y estado base de la plataforma.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
                Configuracion ya deja de ser una vista tecnica vacia y empieza a
                consolidar lo que impacta directamente en el uso diario del panel:
                usuarios, agenda y readiness del sistema.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statCard({
                title: "Admins activos",
                value: data.summary.activeAdmins,
                detail: `${data.summary.totalAdmins} perfiles internos`,
              })}
              {statCard({
                title: "Accesos enlazados",
                value: data.summary.adminsLinkedToAuth,
                detail: `${data.summary.inactiveAdmins} admins inactivos`,
              })}
              {statCard({
                title: "Sesiones activas",
                value: data.summary.activeSessions,
                detail: `${data.summary.verifiedUsers} usuarios verificados`,
              })}
              {statCard({
                title: "Disponibilidad",
                value: data.summary.openDays,
                detail: `${data.summary.upcomingSpecialSchedules} fechas especiales proximas`,
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-sky-400/15 bg-sky-400/10 p-3">
                <Settings2 className="size-5 text-sky-200" strokeWidth={1.7} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                  Areas de control
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">Accesos rapidos</h2>
              </div>
            </div>

            <div className="mt-6">{sectionLinks()}</div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        {panel({
          eyebrow: "Usuarios internos",
          title: "Admins recientes",
          action: (
            <Link
              href="/admin/configuracion/usuarios"
              className="text-sm text-sky-200 transition hover:text-sky-100"
            >
              Ver usuarios
            </Link>
          ),
          children: (
            <div className="space-y-3">
              {data.recentAdmins.map((admin) => (
                <article
                  key={admin.id}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">{admin.fullName}</p>
                      <p className="mt-2 text-sm text-stone-400">{admin.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${readinessChip(
                          admin.isActive
                        )}`}
                      >
                        {admin.isActive ? "Activo" : "Inactivo"}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${readinessChip(
                          admin.hasAuthLink
                        )}`}
                      >
                        {admin.hasAuthLink ? "Login listo" : "Sin login"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-stone-500">
                    Alta {dateFormatter.format(admin.createdAt)} Â· email{" "}
                    {admin.emailVerified ? "verificado" : "no verificado"}
                  </p>
                </article>
              ))}
            </div>
          ),
        })}

        {panel({
          eyebrow: "Agenda base",
          title: "Disponibilidad y excepciones",
          action: (
            <Link
              href="/admin/configuracion/disponibilidad"
              className="text-sm text-sky-200 transition hover:text-sky-100"
            >
              Ver disponibilidad
            </Link>
          ),
          children: (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-sm font-medium text-white">Dias abiertos</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{data.summary.openDays}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
                    {data.summary.closedDays} dias cerrados en la semana base.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-sm font-medium text-white">Fechas especiales</p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {data.summary.upcomingSpecialSchedules}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
                    Excepciones planificadas en las proximas semanas.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {data.upcomingSpecialSchedules.slice(0, 4).map((schedule) => (
                  <article
                    key={schedule.id}
                    className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {dateFormatter.format(schedule.date)}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {schedule.isClosed
                            ? "Cerrado"
                            : `${schedule.openTime ?? "--"} a ${schedule.closeTime ?? "--"}`}
                        </p>
                      </div>
                      <CalendarDays className="size-4 text-sky-200" />
                    </div>
                    {schedule.note ? (
                      <p className="mt-3 text-sm leading-6 text-stone-400">{schedule.note}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ),
        })}
      </div>
    </section>
  );
}

export function ConfigurationUsersSubrouteView({
  data,
}: {
  data: ConfigurationUsersData;
}) {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {statCard({
          title: "Admins",
          value: data.summary.totalAdmins,
          detail: `${data.summary.activeAdmins} activos`,
        })}
        {statCard({
          title: "Sin login",
          value: data.summary.adminsWithoutAuth,
          detail: "Perfiles internos por enlazar a Better Auth.",
        })}
        {statCard({
          title: "Usuarios verificados",
          value: data.summary.verifiedAuthUsers,
          detail: "Cuentas con verificacion de email.",
        })}
        {statCard({
          title: "Usuarios cliente",
          value: data.summary.customerUsers,
          detail: "Cuentas con perfil de cliente.",
        })}
        {statCard({
          title: "Cuentas recientes",
          value: data.authUsers.length,
          detail: "Ultimos usuarios visibles en esta vista.",
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        {panel({
          eyebrow: "Privilegios",
          title: "Perfiles administradores",
          children: (
            <div className="space-y-3">
              {data.adminUsers.map((admin) => (
                <article
                  key={admin.id}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <UserCog className="size-4 text-sky-200" />
                        <p className="text-base font-semibold text-white">{admin.fullName}</p>
                      </div>
                      <p className="mt-2 text-sm text-stone-400">{admin.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${readinessChip(
                          admin.isActive
                        )}`}
                      >
                        {admin.isActive ? "Activo" : "Inactivo"}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${readinessChip(
                          admin.hasAuthLink
                        )}`}
                      >
                        {admin.hasAuthLink ? "Login listo" : "Sin login"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-stone-500">
                    Creado {dateFormatter.format(admin.createdAt)} Â· email{" "}
                    {admin.emailVerified ? "verificado" : "no verificado"}
                  </p>
                </article>
              ))}
            </div>
          ),
        })}

        {panel({
          eyebrow: "Autenticacion",
          title: "Ultimas cuentas Better Auth",
          children: (
            <div className="space-y-3">
              {data.authUsers.map((user) => (
                <article
                  key={user.id}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <Users className="size-4 text-sky-200" />
                        <p className="text-base font-semibold text-white">{user.name}</p>
                      </div>
                      <p className="mt-2 text-sm text-stone-400">{user.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.isAdmin ? (
                        <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-300">
                          Admin
                        </span>
                      ) : null}
                      {user.isCustomer ? (
                        <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-300">
                          Cliente
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${readinessChip(
                          user.emailVerified
                        )}`}
                      >
                        {user.emailVerified ? "Verificado" : "Pendiente"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-stone-500">
                    Creado {dateFormatter.format(user.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          ),
        })}
      </div>
    </section>
  );
}

export function ConfigurationAvailabilitySubrouteView({
  data,
}: {
  data: ConfigurationAvailabilityData;
}) {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCard({
          title: "Dias abiertos",
          value: data.summary.openDays,
          detail: `${data.summary.closedDays} cerrados en la base semanal`,
        })}
        {statCard({
          title: "Fechas especiales",
          value: data.summary.specialSchedules,
          detail: `${data.summary.closures} cierres extraordinarios`,
        })}
        {statCard({
          title: "Horarios cargados",
          value: data.businessHours.length,
          detail: "Cobertura completa de la agenda base.",
        })}
        {statCard({
          title: "Proximas excepciones",
          value: data.specialSchedules.slice(0, 7).length,
          detail: "Ventana operativa visible en esta pantalla.",
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        {panel({
          eyebrow: "Semana base",
          title: "Horarios por dia",
          children: (
            <div className="space-y-3">
              {data.businessHours.map((hour) => (
                <article
                  key={hour.dayOfWeek}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-white">
                        {weekdayLabels[hour.dayOfWeek]}
                      </p>
                      <p className="mt-2 text-sm text-stone-400">
                        {hour.isClosed
                          ? "Cerrado"
                          : `${hour.openTime ?? "--"} a ${hour.closeTime ?? "--"}`}
                      </p>
                    </div>
                    <Clock3 className="size-4 text-sky-200" />
                  </div>
                  {hour.note ? (
                    <p className="mt-3 text-sm leading-6 text-stone-400">{hour.note}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ),
        })}

        {panel({
          eyebrow: "Excepciones",
          title: "Fechas especiales registradas",
          children: (
            <div className="space-y-3">
              {data.specialSchedules.length ? (
                data.specialSchedules.map((schedule) => (
                  <article
                    key={schedule.id}
                    className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-white">
                          {dateFormatter.format(schedule.date)}
                        </p>
                        <p className="mt-2 text-sm text-stone-400">
                          {schedule.isClosed
                            ? "Cerrado"
                            : `${schedule.openTime ?? "--"} a ${schedule.closeTime ?? "--"}`}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${readinessChip(
                          !schedule.isClosed
                        )}`}
                      >
                        {schedule.isClosed ? "Cierre" : "Ajuste"}
                      </span>
                    </div>
                    {schedule.note ? (
                      <p className="mt-3 text-sm leading-6 text-stone-400">{schedule.note}</p>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
                  No hay fechas especiales programadas.
                </div>
              )}
            </div>
          ),
        })}
      </div>
    </section>
  );
}

export function ConfigurationSystemSubrouteView({
  data,
}: {
  data: ConfigurationSystemData;
}) {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCard({
          title: "Usuarios",
          value: data.summary.totalUsers,
          detail: `${data.summary.verifiedUsers} con email verificado`,
        })}
        {statCard({
          title: "Sesiones activas",
          value: data.summary.activeSessions,
          detail: "Sesiones no expiradas al momento del corte.",
        })}
        {statCard({
          title: "Admins enlazados",
          value: data.summary.linkedAdminAccounts,
          detail: "Perfiles admin conectados a Better Auth.",
        })}
        {statCard({
          title: "Clientes enlazados",
          value: data.summary.linkedCustomerAccounts,
          detail: "Clientes con autenticacion conectada.",
        })}
        {statCard({
          title: "Checks",
          value: data.readiness.filter((item) => item.isReady).length,
          detail: `${data.readiness.length} indicadores base visibles`,
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        {panel({
          eyebrow: "Readiness",
          title: "Integraciones base",
          children: (
            <div className="space-y-3">
              {data.readiness.map((item) => (
                <article
                  key={item.label}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="size-4 text-sky-200" />
                        <p className="text-base font-semibold text-white">{item.label}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-400">{item.detail}</p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${readinessChip(
                        item.isReady
                      )}`}
                    >
                      {item.isReady ? "Configurado" : "Pendiente"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ),
        })}

        {panel({
          eyebrow: "Autenticacion",
          title: "Sesiones recientes",
          children: (
            <div className="space-y-3">
              {data.recentSessions.map((session) => (
                <article
                  key={session.id}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <KeyRound className="size-4 text-sky-200" />
                        <p className="text-base font-semibold text-white">{session.userName}</p>
                      </div>
                      <p className="mt-2 text-sm text-stone-400">{session.userEmail}</p>
                    </div>
                    <div className="text-sm text-stone-500">
                      {dateTimeFormatter.format(session.createdAt)}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-300">
                    {session.userAgent ?? "Sin user-agent"} Â· expira{" "}
                    {dateTimeFormatter.format(session.expiresAt)}
                  </p>
                  <p className="mt-2 text-xs text-stone-500">
                    {session.ipAddress ?? "Sin IP registrada"}
                  </p>
                </article>
              ))}
            </div>
          ),
        })}
      </div>
    </section>
  );
}
