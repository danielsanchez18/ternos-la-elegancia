import { getAdminCreateCustomOrderFormData } from "@/lib/admin-orders";
import AdminCreateCustomOrderForm from "@/components/admin/AdminCreateCustomOrderForm";

export default async function NuevaOrdenPersonalizadaPage() {
  const { customers, fabrics } = await getAdminCreateCustomOrderFormData();

  return (
    <AdminCreateCustomOrderForm customers={customers} fabrics={fabrics} />
  );
}
