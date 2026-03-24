import { PackageOpen } from "lucide-react";
import type { ComponentProps } from "react";

import AdminFabricListLayout from "@/components/admin/AdminFabricListLayout";
import { statCard } from "@/components/admin/inventory/inventory-ui";
import { getAdminFabricsListData } from "@/lib/admin-inventory";

export async function AdminInventorySubroute({
  subroute,
}: {
  subroute: string;
}) {
  if (subroute === "telas") {
    const fabrics = await getAdminFabricsListData();
    type FabricListLayoutProps = ComponentProps<typeof AdminFabricListLayout>;

    return (
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {statCard({
            title: "Total de Telas",
            value: fabrics.length,
            detail: "Items registrados en el catálogo.",
          })}
          {statCard({
            title: "Telas activas",
            value: fabrics.filter((fabric) => fabric.active).length,
            detail: "Listas para uso en confección.",
          })}
          {statCard({
            title: "Stock Total Disponible",
            value: `${fabrics
              .reduce((accumulator, fabric) => accumulator + Number(fabric.metersInStock), 0)
              .toFixed(1)} m`,
            detail: "Suma del metraje en almacén.",
          })}
        </div>

        <AdminFabricListLayout
          fabrics={fabrics as unknown as FabricListLayoutProps["fabrics"]}
        />
      </section>
    );
  }

  return (
    <div className="rounded-[2rem] border border-dashed border-white/10 p-12 text-center">
      <PackageOpen className="mx-auto size-12 text-stone-700" />
      <h3 className="mt-4 text-lg font-medium text-white">Próximamente</h3>
      <p className="mt-2 text-stone-400">
        Esta vista de inventario estará disponible pronto.
      </p>
    </div>
  );
}
