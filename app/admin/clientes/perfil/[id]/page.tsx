import { notFound } from "next/navigation";
import { getAdminCustomerDetail } from "@/lib/admin-customers";
import AdminCustomerDetailView from "@/components/admin/AdminCustomerDetailView";

function parseCustomerId(rawId: string) {
  const parsedId = Number.parseInt(rawId, 10);
  return Number.isNaN(parsedId) ? null : parsedId;
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseCustomerId(resolvedParams.id);
  
  if (id === null) {
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
