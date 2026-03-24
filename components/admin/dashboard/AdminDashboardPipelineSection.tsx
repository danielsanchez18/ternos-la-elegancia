import Link from "next/link";

import type { DashboardOrderPipelineItem } from "@/components/admin/dashboard/types";

type AdminDashboardPipelineSectionProps = {
  totalOpenOrders: number;
  orderPipeline: DashboardOrderPipelineItem[];
};

export default function AdminDashboardPipelineSection({
  totalOpenOrders,
  orderPipeline,
}: AdminDashboardPipelineSectionProps) {
  return (
    <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            Pipeline
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Ordenes en proceso</h2>
        </div>
        <span className="rounded-full border border-white/8 px-3 py-1 text-xs text-stone-400">
          {totalOpenOrders} activas
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {orderPipeline.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center justify-between rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
          >
            <div>
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="mt-1 text-xs text-stone-500">Seguimiento del flujo operativo</p>
            </div>
            <p className="text-2xl font-semibold text-white">{item.value}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
