import { notFound } from "next/navigation";

import AdminRentalOrderDetailView from "@/components/admin/orders/admin-rental-order-detail-view";
import { isUuidLike } from "@/src/security/public-id";

export default async function AdminRentalOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuidLike(id)) {
    notFound();
  }

  return <AdminRentalOrderDetailView orderId={id.toLowerCase()} />;
}
