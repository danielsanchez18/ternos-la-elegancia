/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  formatDate,
  formatDateTime,
  statusChipClasses,
} from "@/components/admin/customers/formatters";
import {
  AdminSectionPanel,
  AdminStatCard,
} from "@/components/admin/customers/section-ui";

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

function statCard(props: {
  title: string;
  value: string | number;
  detail: string;
  href?: string;
}) {
  return <AdminStatCard {...props} />;
}

function panel(props: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return <AdminSectionPanel {...props} />;
}

export function AdminCustomersSharedLayout({
  summary,
  activeTab,
  children,
}: {
  summary: any;
  activeTab: string;
  children: React.ReactNode;
}) {
  const heroCards = [
    {
      title: "Clientes activos",
      value: summary.activeCustomers,
      detail: `${summary.totalCustomers} registrados en total`,
    },
    {
      title: "Nuevos este mes",
      value: summary.newCustomersThisMonth,
      detail: `${summary.inactiveCustomers} inactivos para seguimiento`,
    },
    {
      title: "Con medidas vigentes",
      value: summary.customersWithValidMeasurements,
      detail: `${summary.customersWithoutValidMeasurements} sin perfil vigente`,
    },
    {
      title: "Comunicaciones pendientes",
      value: summary.pendingNotifications,
      detail: `${summary.totalNotes} notas y ${summary.totalFiles} archivos en expediente`,
    },
  ];

  const TABS = [
    { id: "listado", label: "Listado", href: "/admin/clientes/listado" },
    { id: "medidas", label: "Mediciones", href: "/admin/clientes/medidas" },
    { id: "expedientes", label: "Expedientes", href: "/admin/clientes/expedientes" },
    { id: "comunicaciones", label: "Comunicaciones", href: "/admin/clientes/comunicaciones" },
  ];

  return (
    <section className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {heroCards.map((card) => (
          <div key={card.title}>{statCard(card)}</div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-8 border-b border-white/10 px-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`pb-4 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${isActive
                  ? "border-emerald-400 text-emerald-300"
                  : "border-transparent text-stone-500 hover:text-stone-300"
                  }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="pt-8">
          {children}
        </div>
      </div>
    </section>
  );
}

export async function AdminCustomersSection() {
  // Redirigir el renderizado de la ruta raiz al submodulo por defecto "listado"
  // para aprovechar el layout unificado.
  return <AdminCustomersSubroute subroute="listado" />;
}

export async function AdminCustomersSubroute({
  subroute,
}: {
  subroute: string;
}) {
  const overviewData = await getAdminCustomersOverviewFromApi();

  if (subroute === "listado") {
    const customers = await getAdminCustomersListFromApi();

    return (
      <AdminCustomersSharedLayout summary={overviewData.summary} activeTab="listado">
        <AdminCustomerListLayout customers={customers as any} />
      </AdminCustomersSharedLayout>
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
    })) as unknown as Array<{ id: number; name: string }>;

    return (
      <AdminCustomersSharedLayout summary={overviewData.summary} activeTab="medidas">
        <div className="space-y-6">
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
                    className="rounded-3xl border border-white/8 bg-white/3 p-5"
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
                          profile={{
                            id: profile.id as unknown as number,
                            customerName: profile.customerName,
                            notes: profile.notes,
                            isActive: profile.isActive,
                            validUntil: profile.validUntil,
                          } as MeasurementProfileActionData}
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
                          profileId={profile.id as unknown as number}
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
        </div>
      </AdminCustomersSharedLayout>
    );
  }

  if (subroute === "expedientes") {
    const data = await getAdminCustomersRecordsData();

    return (
      <AdminCustomersSharedLayout summary={overviewData.summary} activeTab="expedientes">
        <div className="space-y-6">
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
                      className="rounded-3xl border border-white/8 bg-white/3 p-5"
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
                      className="rounded-3xl border border-white/8 bg-white/3 p-5"
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
        </div>
      </AdminCustomersSharedLayout>
    );
  }

  if (subroute === "comunicaciones") {
    const data = await getAdminCustomersCommunicationsData();

    return (
      <AdminCustomersSharedLayout summary={overviewData.summary} activeTab="comunicaciones">
        <div className="space-y-6">
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
                    className="rounded-3xl border border-white/8 bg-white/3 p-5"
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
        </div>
      </AdminCustomersSharedLayout>
    );
  }

  return null;
}
