import { notFound } from "next/navigation";
import { getAdminCustomOrderDetail } from "@/lib/admin-orders";
import { prisma } from "@/lib/prisma";
import AdminEditCustomOrderForm from "@/components/admin/AdminEditCustomOrderForm";

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  if (isNaN(id)) {
    notFound();
  }

  // Fetch order data
  const order = await getAdminCustomOrderDetail(id);
  if (!order) {
    notFound();
  }

  // Fetch customers and fabrics for the selects
  const [customers, fabrics] = await Promise.all([
    prisma.customer.findMany({
      select: { id: true, nombres: true, apellidos: true, dni: true },
      orderBy: { nombres: "asc" },
    }),
    prisma.fabric.findMany({
      select: { id: true, code: true, nombre: true, color: true },
      orderBy: { code: "asc" },
    }),
  ]);

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
