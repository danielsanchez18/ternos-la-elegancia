import { notFound } from "next/navigation";
import { getAdminCustomOrderDetail } from "@/lib/admin-orders";
import AdminCustomOrderDetailView from "@/components/admin/AdminCustomOrderDetailView";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  
  if (isNaN(id)) {
    notFound();
  }

  const order = await getAdminCustomOrderDetail(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <AdminCustomOrderDetailView order={order} />
    </div>
  );
}
