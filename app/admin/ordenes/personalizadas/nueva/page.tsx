import type { ComponentProps } from "react";

import { getAdminCreateCustomOrderFormData } from "@/lib/admin-orders";
import AdminCreateCustomOrderForm from "@/components/admin/AdminCreateCustomOrderForm";

export default async function NuevaOrdenPersonalizadaPage() {
  const { customers, fabrics } = await getAdminCreateCustomOrderFormData();
  type CreateFormProps = ComponentProps<typeof AdminCreateCustomOrderForm>;

  return (
    <AdminCreateCustomOrderForm
      customers={customers as unknown as CreateFormProps["customers"]}
      fabrics={fabrics as unknown as CreateFormProps["fabrics"]}
    />
  );
}
