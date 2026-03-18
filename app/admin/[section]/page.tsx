import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminConfigurationSection } from "@/components/admin/AdminConfigurationModule";
import { AdminCustomersSection } from "@/components/admin/AdminCustomersModule";
import { getAdminSection } from "@/lib/admin-dashboard";

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const currentSection = getAdminSection(section);

  if (!currentSection) {
    notFound();
  }

  if (section === "clientes") {
    return <AdminCustomersSection />;
  }

  if (section === "configuracion") {
    return <AdminConfigurationSection />;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 sm:p-8">
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
            Modulo
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">
            {currentSection.label}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-400 sm:text-base">
            {currentSection.description}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {currentSection.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-3xl border border-white/8 bg-black/20 p-5"
              >
                <p className="text-sm leading-6 text-stone-300">{highlight}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            Modelos implicados
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {currentSection.models.map((model) => (
              <span
                key={model}
                className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-stone-300"
              >
                {model}
              </span>
            ))}
          </div>
        </article>
      </div>

      <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Submodulos
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Rutas base de {currentSection.label.toLowerCase()}
            </h2>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-stone-400">
            {currentSection.subroutes.length} vistas sugeridas
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {currentSection.subroutes.map((subroute) => (
            <Link
              key={subroute.href}
              href={subroute.href}
              className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-white/15 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {subroute.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
                    {subroute.description}
                  </p>
                </div>
                <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-400">
                  Ruta
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-3 py-2 font-mono text-xs text-stone-400">
                {subroute.href}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {subroute.models.map((model) => (
                  <span
                    key={model}
                    className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-stone-300"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
