import { notFound } from "next/navigation";
import {
  getAdminCustomOrderDetail,
  getAdminEditCustomOrderFormData,
  parseAdminCustomOrderId,
} from "@/lib/admin-orders";
import AdminEditCustomOrderForm from "@/components/admin/AdminEditCustomOrderForm";

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseAdminCustomOrderId(resolvedParams.id);

  if (id === null) {
    notFound();
  }

  const order = await getAdminCustomOrderDetail(id);
  if (!order) {
    notFound();
  }

  const { customers, fabrics } = await getAdminEditCustomOrderFormData();

  return (
    <div className="p-4 md:p-8">
      <AdminEditCustomOrderForm 
        initialOrder={order} 
        customers={customers} 
        fabrics={fabrics} 
      />
    </div>
  );
}
