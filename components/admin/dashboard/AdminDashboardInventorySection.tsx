import Link from "next/link";
import { Package2 } from "lucide-react";

import type { DashboardAlertCard } from "@/components/admin/dashboard/types";

type AdminDashboardInventorySectionProps = {
  alertCards: DashboardAlertCard[];
};

export default function AdminDashboardInventorySection({
  alertCards,
}: AdminDashboardInventorySectionProps) {
  return (
    <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
      <div className="flex items-center gap-3">
        <Package2 className="size-5 text-amber-200" strokeWidth={1.7} />
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            Riesgos de inventario
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            Alertas de stock y alquiler
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {alertCards.map((alert) => (
          <Link
            key={alert.title}
            href={alert.href}
            className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
          >
            <p className="text-sm font-medium text-white">{alert.title}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{alert.value}</p>
            <p className="mt-2 text-sm leading-6 text-stone-400">{alert.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
