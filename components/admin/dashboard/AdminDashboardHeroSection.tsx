import Link from "next/link";
import type { ComponentType } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  ShoppingCart,
  Users,
} from "lucide-react";

import type {
  DashboardFocusMetric,
  DashboardHeroCard,
  DashboardHeroCardIcon,
} from "@/components/admin/dashboard/types";

type AdminDashboardHeroSectionProps = {
  heroCards: DashboardHeroCard[];
  focusMetrics: DashboardFocusMetric[];
};

const heroIconMap: Record<
  DashboardHeroCardIcon,
  ComponentType<{ className?: string; strokeWidth?: number }>
> =
  {
    customers: Users,
    orders: ShoppingCart,
    revenue: CreditCard,
    agenda: CalendarClock,
  };

export default function AdminDashboardHeroSection({
  heroCards,
  focusMetrics,
}: AdminDashboardHeroSectionProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,rgba(14,33,24,0.85),rgba(8,8,8,0.95))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8">
      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-5">
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
            Operacion en vivo
          </span>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Supervisa cartera, agenda, inventario y cobranza desde un solo lugar.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
              La home del dashboard ahora prioriza presion operativa real: pipeline de
              ordenes, citas de corto plazo, inventario en riesgo y salud de pagos y
              notificaciones.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {heroCards.map((card) => {
              const Icon = heroIconMap[card.icon];

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="rounded-3xl border border-white/8 bg-black/20 p-5 transition hover:bg-black/30"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-stone-200">{card.title}</p>
                    <Icon className="size-4 text-emerald-200" strokeWidth={1.7} />
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-400">{card.detail}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 p-3">
              <AlertTriangle className="size-5 text-amber-200" strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Atencion inmediata
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">Enfoque operativo</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {focusMetrics.map((metric) => (
              <div
                key={metric.title}
                className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
              >
                <p className="text-sm font-medium text-stone-200">{metric.title}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-stone-400">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
