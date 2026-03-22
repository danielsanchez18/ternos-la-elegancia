import Link from "next/link";
import {
  PackageOpen,
  FolderKanban,
  Scissors,
  AlertTriangle,
} from "lucide-react";
import AdminFabricListLayout from "@/components/admin/AdminFabricListLayout";
import {
  getAdminFabricsListData,
  getAdminFabricsOverviewData,
} from "@/lib/admin-inventory";
import { getAdminSection } from "@/lib/admin-dashboard";

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
});

function parseDateValue(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: Date | string | null | undefined): string {
  const parsed = parseDateValue(value);
  return parsed ? dateFormatter.format(parsed) : "--";
}

const numberFormatter = new Intl.NumberFormat("en-US");

function statCard({
  title,
  value,
  detail,
  icon: Icon,
  alert = false,
}: {
  title: string;
  value: string | number;
  detail: React.ReactNode;
  icon?: React.ElementType;
  alert?: boolean;
}) {
  return (
    <article
      className={`rounded-[2rem] border p-6 ${alert
          ? "border-amber-500/30 bg-amber-500/10"
          : "border-white/8 bg-white/[0.02]"
        }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-[11px] uppercase tracking-[0.3em] ${alert ? "text-amber-400" : "text-stone-500"
            }`}
        >
          {title}
        </p>
        {Icon && (
          <Icon
            className={`size-5 ${alert ? "text-amber-400" : "text-stone-600"}`}
          />
        )}
      </div>
      <p
        className={`mt-4 text-4xl font-semibold tracking-tight ${alert ? "text-amber-50" : "text-white"
          }`}
      >
        {value}
      </p>
      <div
        className={`mt-3 text-sm leading-6 ${alert ? "text-amber-200" : "text-stone-400"
          }`}
      >
        {detail}
      </div>
    </article>
  );
}

function panel({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <article className="rounded-[2rem] border border-white/8 bg-black/30 p-6 sm:p-8">
      <header className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        </div>
        {action}
      </header>
      <div className="mt-6">{children}</div>
    </article>
  );
}

function sectionLinks() {
  const section = getAdminSection("inventario");
  if (!section) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {section.subroutes.map((sub) => (
        <Link
          key={sub.slug}
          href={sub.href}
          className="group block rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]"
        >
          <p className="font-medium text-white group-hover:text-emerald-300">
            {sub.label}
          </p>
          <p className="mt-1 text-xs text-stone-500">{sub.description}</p>
        </Link>
      ))}
    </div>
  );
}

export async function AdminInventorySection() {
  const data = await getAdminFabricsOverviewData();

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {statCard({
          title: "Total de telas",
          value: numberFormatter.format(data.totalFabrics),
          detail: "Tipos de telas registradas en almacén.",
          icon: Scissors,
        })}
        {statCard({
          title: "Telas activas",
          value: numberFormatter.format(data.activeFabrics),
          detail: "Telas habilitadas para confecciones.",
        })}
        {statCard({
          title: "Stock normal",
          value: numberFormatter.format(
            data.activeFabrics - data.lowStockFabrics - data.outOfStockFabrics
          ),
          detail: "Telas con stock suficiente.",
        })}
        {statCard({
          title: "Requieren compra",
          value: numberFormatter.format(
            data.lowStockFabrics + data.outOfStockFabrics
          ),
          detail: `${data.lowStockFabrics} bajo métrica, ${data.outOfStockFabrics} agotadas.`,
          icon: AlertTriangle,
          alert: data.lowStockFabrics > 0 || data.outOfStockFabrics > 0,
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3">
              <FolderKanban
                className="size-5 text-emerald-200"
                strokeWidth={1.7}
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Flujos del módulo
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Accesos rápidos
              </h2>
            </div>
          </div>

          <div className="mt-6">{sectionLinks()}</div>
        </div>

        {panel({
          eyebrow: "Actividad",
          title: "Últimos movimientos",
          action: (
            <Link
              href="/admin/inventario/telas"
              className="text-sm text-emerald-200 transition hover:text-emerald-100"
            >
              Ver almacén
            </Link>
          ),
          children: (
            <div className="space-y-3">
              {data.recentMovements.length ? (
                data.recentMovements.map((mov: any) => (
                  <article
                    key={mov.id}
                    className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {mov.fabric.code} - {mov.fabric.nombre}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        {mov.note || "Sin nota"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${mov.type === "INGRESO"
                            ? "text-emerald-400"
                            : mov.type === "SALIDA"
                              ? "text-rose-400"
                              : "text-amber-400"
                          }`}
                      >
                        {mov.type === "INGRESO" ? "+" : ""}
                        {Number(mov.quantity)}m
                      </p>
                      <p className="mt-1 text-[10px] text-stone-500">
                        {formatDate(mov.happenedAt)}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
                  No hay movimientos de inventario recientes.
                </div>
              )}
            </div>
          ),
        })}
      </div>
    </section>
  );
}

export async function AdminInventorySubroute({
  subroute,
}: {
  subroute: string;
}) {
  if (subroute === "telas") {
    const fabrics = await getAdminFabricsListData();

    return (
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {statCard({
            title: "Total de Telas",
            value: fabrics.length,
            detail: "Items registrados en el catálogo.",
          })}
          {statCard({
            title: "Telas activas",
            value: fabrics.filter((f: any) => f.active).length,
            detail: "Listas para uso en confección.",
          })}
          {statCard({
            title: "Stock Total Disponible",
            value: `${fabrics
              .reduce((acc: number, f: any) => acc + Number(f.metersInStock), 0)
              .toFixed(1)} m`,
            detail: "Suma del metraje en almacén.",
          })}
        </div>

        <AdminFabricListLayout fabrics={fabrics as any} />
      </section>
    );
  }

  return (
    <div className="rounded-[2rem] border border-dashed border-white/10 p-12 text-center">
      <PackageOpen className="mx-auto size-12 text-stone-700" />
      <h3 className="mt-4 text-lg font-medium text-white">Próximamente</h3>
      <p className="mt-2 text-stone-400">
        Esta vista de inventario estará disponible pronto.
      </p>
    </div>
  );
}
