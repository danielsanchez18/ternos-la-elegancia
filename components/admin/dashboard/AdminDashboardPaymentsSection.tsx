import Link from "next/link";

import type { DashboardRecentPayment } from "@/components/admin/dashboard/types";

type AdminDashboardPaymentsSectionProps = {
  recentPayments: DashboardRecentPayment[];
};

export default function AdminDashboardPaymentsSection({
  recentPayments,
}: AdminDashboardPaymentsSectionProps) {
  return (
    <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            Caja reciente
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Ultimos pagos registrados
          </h2>
        </div>
        <Link
          href="/admin/comercial/pagos"
          className="text-sm text-emerald-200 transition hover:text-emerald-100"
        >
          Ver pagos
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {recentPayments.length ? (
          recentPayments.map((payment) => (
            <article
              key={payment.id}
              className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{payment.customerName}</p>
                  <p className="mt-1 text-sm text-stone-400">
                    {payment.methodLabel} · {payment.paidAtLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">{payment.amountLabel}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                    {payment.statusLabel}
                  </p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
            Aun no hay pagos registrados.
          </div>
        )}
      </div>
    </section>
  );
}
