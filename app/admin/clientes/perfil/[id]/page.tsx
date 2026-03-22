import { notFound } from "next/navigation";
import { getAdminCustomerDetail } from "@/lib/admin-customers";
import AdminCustomerDetailView from "@/components/admin/AdminCustomerDetailView";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  
  if (isNaN(id)) {
    notFound();
  }

  const customer = await getAdminCustomerDetail(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <AdminCustomerDetailView customer={customer} />
    </div>
  );
}
