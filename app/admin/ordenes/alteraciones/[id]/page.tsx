import { notFound } from "next/navigation";

import AdminAlterationOrderDetailView from "@/components/admin/orders/admin-alteration-order-detail-view";
import { isUuidLike } from "@/src/security/public-id";

export default async function AdminAlterationOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuidLike(id)) {
    notFound();
  }

  return <AdminAlterationOrderDetailView orderId={id.toLowerCase()} />;
}
