import { MessagesSquare } from "lucide-react";

import type { DashboardExecutiveSummary } from "@/components/admin/dashboard/types";

type AdminDashboardExecutiveSummarySectionProps = {
  executiveSummary: DashboardExecutiveSummary;
};

export default function AdminDashboardExecutiveSummarySection({
  executiveSummary,
}: AdminDashboardExecutiveSummarySectionProps) {
  return (
    <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
      <div className="flex items-center gap-3">
        <MessagesSquare className="size-5 text-emerald-200" strokeWidth={1.7} />
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            Cierre del tablero
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            Resumen ejecutivo del sistema
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-sm font-medium text-white">Presion operativa</p>
          <p className="mt-3 text-sm leading-7 text-stone-400">
            {executiveSummary.operational}
          </p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-sm font-medium text-white">Liquidez</p>
          <p className="mt-3 text-sm leading-7 text-stone-400">{executiveSummary.liquidity}</p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-sm font-medium text-white">Salud de servicio</p>
          <p className="mt-3 text-sm leading-7 text-stone-400">
            {executiveSummary.serviceHealth}
          </p>
        </div>
      </div>
    </section>
  );
}
