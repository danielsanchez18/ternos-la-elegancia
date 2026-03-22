import { prisma } from "@/lib/prisma";
import AdminCreateCustomOrderForm from "@/components/admin/AdminCreateCustomOrderForm";

export default async function NuevaOrdenPersonalizadaPage() {
  const [customers, fabrics] = await Promise.all([
    prisma.customer.findMany({
      select: { id: true, nombres: true, apellidos: true, dni: true },
      orderBy: { nombres: "asc" },
    }),
    prisma.fabric.findMany({
      where: { active: true },
      select: { id: true, code: true, nombre: true, color: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <AdminCreateCustomOrderForm customers={customers} fabrics={fabrics} />
  );
}
