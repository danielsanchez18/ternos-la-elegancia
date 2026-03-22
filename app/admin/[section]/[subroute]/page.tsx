import { notFound } from "next/navigation";

import { AdminConfigurationSubroute } from "@/components/admin/AdminConfigurationModule";
import { AdminCustomersSubroute } from "@/components/admin/AdminCustomersModule";
import { AdminAppointmentsSubroute } from "@/components/admin/AdminAppointmentsModule";
import { AdminInventorySubroute } from "@/components/admin/AdminInventoryModule";
import { AdminOrdersSubroute } from "@/components/admin/AdminOrdersModule";
import { getAdminSection, getAdminSubroute } from "@/lib/admin-dashboard";

export default async function AdminSubroutePage({
  params,
}: {
  params: Promise<{ section: string; subroute: string }>;
}) {
  const { section, subroute } = await params;
  const currentSection = getAdminSection(section);
  const currentSubroute = getAdminSubroute(section, subroute);

  if (!currentSection || !currentSubroute) {
    notFound();
  }

  if (section === "clientes") {
    return <AdminCustomersSubroute subroute={subroute} />;
  }

  if (section === "citas") {
    return <AdminAppointmentsSubroute subroute={subroute} />;
  }

  if (section === "inventario") {
    return <AdminInventorySubroute subroute={subroute} />;
  }

  if (section === "ordenes") {
    return <AdminOrdersSubroute subroute={subroute} />;
  }

  if (section === "configuracion") {
    return <AdminConfigurationSubroute subroute={subroute} />;
  }

  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 sm:p-8">
        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
          Ruta semilla
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">
          {currentSubroute.label}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-400 sm:text-base">
          {currentSubroute.description}
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Ruta recomendada
            </p>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 font-mono text-sm text-stone-200">
              {currentSubroute.href}
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-400">
              Esta vista funciona como punto de partida para construir filtros,
              tablas, formularios y detalle contextual dentro del modulo{" "}
              {currentSection.label.toLowerCase()}.
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Entidades relacionadas
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {currentSubroute.models.map((model) => (
                <span
                  key={model}
                  className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-stone-300"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
          Siguiente expansion
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">Listado</h2>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Tabla o board con filtros, estados y acciones rapidas.
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">Detalle</h2>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Vista por entidad con timeline, relaciones y actividad historica.
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">Automacion</h2>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Reglas de negocio, cambios de estado y eventos derivados de la operacion.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
