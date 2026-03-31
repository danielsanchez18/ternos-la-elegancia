"use client";

import { SlidersHorizontal, Sparkles, Wand2 } from "lucide-react";
import { AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";

export default function AdminCatalogPersonalizationsSubroute() {
  return (
    <section className="space-y-6">
      <Panel
        eyebrow="Bespoke / Hecho a medida"
        title="Catálogo de Personalizaciones"
      >
        <div className="rounded-[2.5rem] border border-dashed border-white/10 bg-white/1 p-12 lg:p-20 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <Wand2 className="size-10 text-emerald-400" />
          </div>

          <div className="mx-auto mt-8 max-w-2xl">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              Próxima Fase: Configuración Bespoke
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-stone-400">
              Estamos preparando el motor de personalización para gestionar opciones avanzadas de sastrería:
            </p>

            <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Tipos de Solapa",
                "Estilos de Bolsillo",
                "Aberturas Traseras",
                "Forros Interiores",
                "Bordado de Iniciales",
                "Configuraciones de Puño"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/40 p-4 transition hover:border-emerald-500/30 group">
                  <div className="size-2 rounded-full bg-emerald-500/40 group-hover:bg-emerald-400 transition-colors" />
                  <span className="text-sm font-medium text-stone-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-semibold text-emerald-300">
              <Sparkles className="size-3.5" />
              Pendiente de integración con los nuevos endpoints de API
            </div>
          </div>
        </div>
      </Panel>

      <Panel eyebrow="Documentación" title="¿Qué define este módulo?">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/5 bg-white/2 p-8">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-cyan-500/10 p-3">
                <SlidersHorizontal className="size-6 text-cyan-400" />
              </div>
              <h5 className="text-lg font-bold text-white">Lógica de Selección</h5>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-400">
              Este módulo permitirá definir qué opciones son compatibles con cada tipo de producto (Ternos, Sacos, Camisas). El sastre o administrador podrá activar/desactivar opciones según la temporada o disponibilidad de materiales.
            </p>
          </article>

          <article className="rounded-3xl border border-white/5 bg-white/2 p-8">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-violet-500/10 p-3">
                <Sparkles className="size-6 text-violet-400" />
              </div>
              <h5 className="text-lg font-bold text-white">Costos Adicionales</h5>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-400">
              Cada personalización podrá llevar asociado un costo extra (Premium Lining, Monogramming), que se sumará automáticamente al presupuesto de la orden a medida durante el flujo de venta.
            </p>
          </article>
        </div>
      </Panel>
    </section>
  );
}
