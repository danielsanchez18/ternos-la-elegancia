"use client";

import { PackageOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AdminFabricListLayout from "@/components/admin/inventory/admin-fabric-list-layout";
import AdminRentalUnitsSubroute from "@/components/admin/inventory/admin-rental-units-subroute";
import { AdminInventorySection } from "@/components/admin/inventory/admin-inventory-section";

export function AdminInventorySharedLayout({
  activeTab,
  children,
}: {
  activeTab: string;
  children: React.ReactNode;
}) {
  const TABS = [
    { id: "resumen", label: "Resumen", href: "/admin/inventario" },
    { id: "telas", label: "Telas", href: "/admin/inventario/telas" },
    { id: "unidades-renta", label: "Prendas de Alquiler", href: "/admin/inventario/unidades-renta" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-8 border-b border-white/10 px-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`pb-4 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                isActive
                  ? "border-emerald-400 text-emerald-300"
                  : "border-transparent text-stone-500 hover:text-stone-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {children}
      </div>
    </div>
  );
}

export function AdminInventorySubroute({
  subroute,
}: {
  subroute: string;
}) {
  const renderContent = () => {
    switch (subroute) {
      case "resumen":
        return <AdminInventorySection isSubroute />;
      case "telas":
        return <AdminFabricListLayout />;
      case "unidades-renta":
        return <AdminRentalUnitsSubroute />;
      default:
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
  };

  return (
    <AdminInventorySharedLayout activeTab={subroute}>
      {renderContent()}
    </AdminInventorySharedLayout>
  );
}
