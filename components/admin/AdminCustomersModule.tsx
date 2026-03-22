import Link from "next/link";
import {
  FileStack,
  FolderKanban,
  Ruler,
} from "lucide-react";
import AdminCreateCustomerForm from "@/components/admin/AdminCreateCustomerForm";
import AdminCustomerActions from "@/components/admin/AdminCustomerActions";
import type { CustomerActionData } from "@/components/admin/AdminCustomerActions";
import AdminCreateMeasurementProfileForm from "@/components/admin/AdminCreateMeasurementProfileForm";
import AdminMeasurementProfileActions from "@/components/admin/AdminMeasurementProfileActions";
import type { MeasurementProfileActionData } from "@/components/admin/AdminMeasurementProfileActions";
import { MeasurementValuesModal } from "@/components/admin/AdminMeasurementValuesForm";
import type { MeasurementGarmentType } from "@/components/admin/AdminMeasurementValuesForm";
import AdminMeasurementGarmentChips from "@/components/admin/AdminMeasurementGarmentChips";
import AdminCustomerListLayout from "@/components/admin/AdminCustomerListLayout";

import {
  getAdminCustomersCommunicationsData,
  getAdminCustomersMeasurementsData,
  getAdminCustomersRecordsData,
  getAdminCustomersListData,
} from "@/lib/admin-customers";
import {
  getAdminCustomersListFromApi,
  getAdminCustomersOverviewFromApi,
} from "@/lib/admin-api";
import { getAdminSection } from "@/lib/admin-dashboard";

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "short",
  timeStyle: "short",
});

function parseDateValue(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: Date | string | null | undefined): string {
  const parsed = parseDateValue(value);
  return parsed ? dateFormatter.format(parsed) : "--";
}

function formatDateTime(value: Date | string | null | undefined): string {
  const parsed = parseDateValue(value);
  return parsed ? dateTimeFormatter.format(parsed) : "--";
}

function statusChipClasses(isPositive: boolean) {
  return isPositive
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
    : "border-white/8 bg-white/[0.03] text-stone-300";
}

function statCard({
  title,
  value,
  detail,
  href,
}: {
  title: string;
  value: string | number;
  detail: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
      <p className="text-sm font-medium text-stone-200">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone-400">{detail}</p>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="transition hover:translate-y-[-1px] hover:bg-white/[0.02]">
      {content}
    </Link>
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
  const section = getAdminSection("clientes");

  if (!section) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {section.subroutes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
        >
          <p className="text-base font-semibold text-white">{route.label}</p>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            {route.description}
          </p>
        </Link>
      ))}
    </div>
  );
}

export async function AdminCustomersSection() {
  const data = await getAdminCustomersOverviewFromApi();

  const heroCards = [
    {
      title: "Clientes activos",
      value: data.summary.activeCustomers,
      detail: `${data.summary.totalCustomers} registrados en total`,
      href: "/admin/clientes/listado",
    },
    {
      title: "Nuevos este mes",
      value: data.summary.newCustomersThisMonth,
      detail: `${data.summary.inactiveCustomers} inactivos para seguimiento`,
      href: "/admin/clientes/listado",
    },
    {
      title: "Con medidas vigentes",
      value: data.summary.customersWithValidMeasurements,
      detail: `${data.summary.customersWithoutValidMeasurements} sin perfil vigente`,
      href: "/admin/clientes/medidas",
    },
    {
      title: "Comunicaciones pendientes",
      value: data.summary.pendingNotifications,
      detail: `${data.summary.totalNotes} notas y ${data.summary.totalFiles} archivos en expediente`,
      href: "/admin/clientes/comunicaciones",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col 2xl:grid 2xl:grid-cols-[1.4fr_0.6fr] gap-4">
        <article className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,rgba(10,35,28,0.84),rgba(8,8,8,0.95))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
              Gestion de relacion
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Centraliza cartera, medidas, expedientes y comunicaciones del cliente.
              </h1>
              <p className="text-sm leading-7 text-stone-300 sm:text-base">
                Este modulo ya esta orientado a la operacion diaria: identifica
                clientes con medidas vigentes, actividad reciente y pendientes de
                seguimiento en un solo frente.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {heroCards.map((card) => (
                <div key={card.title}>
                  {statCard(card)}
                </div>
              ))}
            </div>
          </div>
        </article>
        
        <div className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3">
              <FolderKanban className="size-5 text-emerald-200" strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Flujos del modulo
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Accesos rapidos
              </h2>
            </div>
          </div>

          <div className="mt-6">{sectionLinks()}</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        {panel({
          eyebrow: "Actividad reciente",
          title: "Clientes con movimiento",
          action: (
            <Link
              href="/admin/clientes/listado"
              className="text-sm text-emerald-200 transition hover:text-emerald-100"
            >
              Ver listado
            </Link>
          ),
          children: (
            <div className="grid gap-3">
              {data.recentCustomers.map((customer) => (
                <article
                  key={customer.id}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-white">
                          {customer.fullName}
                        </p>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${statusChipClasses(
                            customer.isActive
                          )}`}
                        >
                          {customer.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-stone-400">
                        {customer.email} · {customer.celular ?? "Sin celular"} · DNI {customer.dni}
                      </p>
                    </div>
                    <div className="text-sm text-stone-400">
                      Actualizado {formatDate(customer.updatedAt)}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Ordenes
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {customer.orderCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Medidas vigentes
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {customer.validMeasurementUntil
                            ? `Hasta ${formatDate(customer.validMeasurementUntil)}`
                          : "Sin perfil vigente"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Proxima cita
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {customer.nextAppointmentAt
                            ? formatDateTime(customer.nextAppointmentAt)
                          : "Sin cita programada"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ),
        })}

        {panel({
          eyebrow: "Seguimiento",
          title: "Proximas citas de clientes",
          action: (
            <Link
              href="/admin/citas/agenda"
              className="text-sm text-emerald-200 transition hover:text-emerald-100"
            >
              Ver agenda
            </Link>
          ),
          children: (
            <div className="space-y-3">
              {data.upcomingAppointments.length ? (
                data.upcomingAppointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                  >
                    <p className="text-sm font-medium text-white">
                      {appointment.customerName}
                    </p>
                    <p className="mt-2 text-sm text-stone-400">
                      {appointment.type.replaceAll("_", " ").toLowerCase()} · {appointment.code}
                    </p>
                    <p className="mt-3 text-sm text-stone-200">
                      {formatDateTime(appointment.scheduledAt)}
                    </p>
                    <div className="mt-3 inline-flex rounded-full border border-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-400">
                      {appointment.status.replaceAll("_", " ").toLowerCase()}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
                  No hay citas proximas vinculadas a clientes.
                </div>
              )}
            </div>
          ),
        })}
      </div>
    </section>
  );
}

export async function AdminCustomersSubroute({
  subroute,
}: {
  subroute: string;
}) {
  if (subroute === "listado") {
    const customers = await getAdminCustomersListFromApi();

    return (
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {statCard({
            title: "Clientes cargados",
            value: customers.length,
            detail: "Vista operativa inicial de la cartera mas reciente.",
          })}
          {statCard({
            title: "Con perfil vigente",
            value: customers.filter((item) => Boolean(item.validMeasurementUntil)).length,
            detail: "Clientes listos para ventas o personalizadas con respaldo de medidas.",
          })}
          {statCard({
            title: "Sin actividad reciente",
            value: customers.filter((item) => !item.lastAppointmentAt && item.orderCount === 0).length,
            detail: "Clientes para reactivacion o contacto comercial.",
          })}
        </div>

        <AdminCustomerListLayout customers={customers as any} />
      </section>
    );
  }

  if (subroute === "medidas") {
    const [data, customersList] = await Promise.all([
      getAdminCustomersMeasurementsData(),
      getAdminCustomersListData(),
    ]);

    const mappedCustomers = customersList.map(c => ({
      id: c.id,
      name: `${c.nombres} ${c.apellidos || ""}`.trim()
    }));

    return (
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {statCard({
            title: "Perfiles",
            value: data.summary.totalProfiles,
            detail: "Historial total de perfiles de medidas.",
          })}
          {statCard({
            title: "Activos",
            value: data.summary.activeProfiles,
            detail: `${data.summary.inactiveProfiles} perfiles no vigentes`,
          })}
          {statCard({
            title: "Vencen pronto",
            value: data.summary.expiringProfiles,
            detail: "Requieren seguimiento dentro de 30 dias.",
          })}
          {statCard({
            title: "Sin perfiles",
            value: data.summary.customersWithoutProfiles,
            detail: "Clientes sin registro de medidas.",
          })}
          {statCard({
            title: "Sin vigencia",
            value: data.summary.customersWithoutValidProfiles,
            detail: "Clientes sin medidas activas para produccion.",
          })}
          {statCard({
            title: "Ultimos perfiles",
            value: data.recentProfiles.length,
            detail: "Corte operativo para trabajo inmediato.",
          })}
        </div>

        <AdminCreateMeasurementProfileForm customers={mappedCustomers} />

        {panel({
          eyebrow: "Medicion",
          title: "Perfiles recientes y validez",
          children: (
            <div className="grid gap-3">
              {data.recentProfiles.map((profile) => (
                <article
                  key={profile.id}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <Ruler className="size-4 text-emerald-200" />
                        <p className="text-base font-semibold text-white">
                          {profile.customerName}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-stone-400">
                        Tomado el {formatDate(profile.takenAt)} · valido hasta{" "}
                        {formatDate(profile.validUntil)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${statusChipClasses(
                          profile.isActive
                        )}`}
                      >
                        {profile.isActive ? "Activo" : "Inactivo"}
                      </span>
                      <AdminMeasurementProfileActions
                        profile={
                          {
                            id: profile.id,
                            customerName: profile.customerName,
                            notes: profile.notes,
                            isActive: profile.isActive,
                            validUntil: profile.validUntil,
                          } satisfies MeasurementProfileActionData
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Prendas
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {profile.garmentCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Valores
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {profile.valueCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Tipos
                      </p>
                      <AdminMeasurementGarmentChips
                        profileId={profile.id}
                        customerName={profile.customerName}
                        garments={profile.garments}
                      />
                    </div>
                  </div>

                  {profile.notes ? (
                    <p className="mt-4 text-sm leading-6 text-stone-400">{profile.notes}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ),
        })}
      </section>
    );
  }

  if (subroute === "expedientes") {
    const data = await getAdminCustomersRecordsData();

    return (
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {statCard({
            title: "Notas totales",
            value: data.summary.totalNotes,
            detail: `${data.summary.notesThisMonth} generadas este mes`,
          })}
          {statCard({
            title: "Clientes con notas",
            value: data.summary.customersWithNotes,
            detail: "Expedientes con seguimiento escrito.",
          })}
          {statCard({
            title: "Archivos totales",
            value: data.summary.totalFiles,
            detail: `${data.summary.filesThisMonth} incorporados este mes`,
          })}
          {statCard({
            title: "Clientes con archivos",
            value: data.summary.customersWithFiles,
            detail: "Documentacion vinculada al cliente.",
          })}
          {statCard({
            title: "Notas recientes",
            value: data.recentNotes.length,
            detail: "Corte visible en esta vista.",
          })}
          {statCard({
            title: "Archivos recientes",
            value: data.recentFiles.length,
            detail: "Ultimos adjuntos del expediente.",
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          {panel({
            eyebrow: "Bitacora",
            title: "Notas recientes",
            children: (
              <div className="space-y-3">
                {data.recentNotes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">{note.customerName}</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatDateTime(note.createdAt)} · {note.adminName}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-300">{note.note}</p>
                  </article>
                ))}
              </div>
            ),
          })}

          {panel({
            eyebrow: "Adjuntos",
            title: "Archivos del expediente",
            children: (
              <div className="space-y-3">
                {data.recentFiles.map((file) => (
                  <article
                    key={file.id}
                    className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-center gap-3">
                      <FileStack className="size-4 text-emerald-200" />
                      <div>
                        <p className="text-sm font-medium text-white">{file.fileName}</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {file.customerName} · {formatDateTime(file.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-300">
                      {file.description ?? file.mimeType ?? "Sin descripcion"}
                    </p>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm text-emerald-200 transition hover:text-emerald-100"
                    >
                      Abrir archivo
                    </a>
                  </article>
                ))}
              </div>
            ),
          })}
        </div>
      </section>
    );
  }

  if (subroute === "comunicaciones") {
    const data = await getAdminCustomersCommunicationsData();

    return (
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
          {statCard({
            title: "Total",
            value: data.summary.totalNotifications,
            detail: "Mensajes asociados a clientes u operacion.",
          })}
          {statCard({
            title: "Pendientes",
            value: data.summary.pendingNotifications,
            detail: "Requieren despacho o atencion.",
          })}
          {statCard({
            title: "Enviadas",
            value: data.summary.sentNotifications,
            detail: "Despachadas correctamente.",
          })}
          {statCard({
            title: "Fallidas",
            value: data.summary.failedNotifications,
            detail: "Necesitan revision.",
          })}
          {statCard({
            title: "Email",
            value: data.summary.emailNotifications,
            detail: "Canal formal principal.",
          })}
          {statCard({
            title: "WhatsApp",
            value: data.summary.whatsappNotifications,
            detail: "Seguimiento conversacional.",
          })}
          {statCard({
            title: "Interno",
            value: data.summary.internalNotifications,
            detail: "Uso operativo del sistema.",
          })}
        </div>

        {panel({
          eyebrow: "Historial",
          title: "Ultimas comunicaciones",
          children: (
            <div className="space-y-3">
              {data.recentNotifications.map((notification) => (
                <article
                  key={notification.id}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {notification.customerName}
                        </p>
                        <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-400">
                          {notification.channel.toLowerCase()}
                        </span>
                        <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-400">
                          {notification.status.toLowerCase()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-stone-400">
                        {notification.subject ?? notification.relatedCode ?? "Sin asunto"}
                      </p>
                    </div>
                    <p className="text-sm text-stone-500">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-stone-300">
                    {notification.message}
                  </p>

                  <p className="mt-3 text-xs text-stone-500">
                    {notification.sentAt
                      ? `Enviada ${formatDateTime(notification.sentAt)}`
                      : "Aun no enviada"}
                  </p>
                </article>
              ))}
            </div>
          ),
        })}
      </section>
    );
  }

  return null;
}
