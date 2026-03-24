import AdminDashboardAppointmentsSection from "@/components/admin/dashboard/AdminDashboardAppointmentsSection";
import AdminDashboardExecutiveSummarySection from "@/components/admin/dashboard/AdminDashboardExecutiveSummarySection";
import AdminDashboardHeroSection from "@/components/admin/dashboard/AdminDashboardHeroSection";
import AdminDashboardInventorySection from "@/components/admin/dashboard/AdminDashboardInventorySection";
import AdminDashboardPaymentsSection from "@/components/admin/dashboard/AdminDashboardPaymentsSection";
import AdminDashboardPipelineSection from "@/components/admin/dashboard/AdminDashboardPipelineSection";
import { buildAdminDashboardViewModel } from "@/components/admin/dashboard/view-model";
import { getAdminDashboardMetricsFromApi } from "@/lib/admin-api";

export default async function AdminPage() {
  const metrics = await getAdminDashboardMetricsFromApi();
  const viewModel = buildAdminDashboardViewModel(metrics);

  return (
    <section className="space-y-6">
      <AdminDashboardHeroSection
        heroCards={viewModel.heroCards}
        focusMetrics={viewModel.focusMetrics}
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <AdminDashboardPipelineSection
          totalOpenOrders={viewModel.totalOpenOrders}
          orderPipeline={viewModel.orderPipeline}
        />
        <AdminDashboardAppointmentsSection
          recentAppointments={viewModel.recentAppointments}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <AdminDashboardInventorySection alertCards={viewModel.alertCards} />
        <AdminDashboardPaymentsSection recentPayments={viewModel.recentPayments} />
      </div>

      <AdminDashboardExecutiveSummarySection
        executiveSummary={viewModel.executiveSummary}
      />
    </section>
  );
}
