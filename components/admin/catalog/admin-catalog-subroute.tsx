"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageOpen } from "lucide-react";

import { apiGet } from "@/components/admin/catalog/api";
import { AdminStatCard } from "@/components/admin/customers/section-ui";
import type {
  AdminBrand,
  AdminBundle,
  AdminCatalogAttributeDefinition,
  AdminProduct,
} from "@/components/admin/catalog/types";

import AdminCatalogProductsSubroute from "@/components/admin/catalog/admin-catalog-products-subroute";
import AdminCatalogBrandsSubroute from "@/components/admin/catalog/admin-catalog-brands-subroute";
import AdminCatalogBundlesSubroute from "@/components/admin/catalog/admin-catalog-bundles-subroute";
import AdminCatalogAttributesSubroute from "@/components/admin/catalog/admin-catalog-attributes-subroute";
import AdminCatalogPersonalizationsSubroute from "@/components/admin/catalog/admin-catalog-personalizations-subroute";

type CatalogSummary = {
  totalProducts: number;
  activeProducts: number;
  rentalProducts: number;
  totalBrands: number;
  activeBrands: number;
  totalBundles: number;
  activeBundles: number;
  totalAttributes: number;
  activeAttributes: number;
  totalVariants: number;
};

const EMPTY_SUMMARY: CatalogSummary = {
  totalProducts: 0,
  activeProducts: 0,
  rentalProducts: 0,
  totalBrands: 0,
  activeBrands: 0,
  totalBundles: 0,
  activeBundles: 0,
  totalAttributes: 0,
  activeAttributes: 0,
  totalVariants: 0,
};

export function AdminCatalogSharedLayout({
  activeTab,
  summary,
  children,
}: {
  activeTab: string;
  summary: CatalogSummary;
  children: React.ReactNode;
}) {
  const TABS = [
    { id: "productos", label: "Productos", href: "/admin/catalogo/productos" },
    { id: "marcas", label: "Marcas", href: "/admin/catalogo/marcas" },
    { id: "bundles", label: "Bundles", href: "/admin/catalogo/bundles" },
    { id: "personalizaciones", label: "Personalizaciones", href: "/admin/catalogo/personalizaciones" },
    { id: "atributos", label: "Atributos", href: "/admin/catalogo/atributos" },
  ];

  const statCards = [
    {
      title: "Productos",
      value: summary.totalProducts,
      detail: `${summary.activeProducts} activos en tienda`,
    },
    {
      title: "Marcas",
      value: summary.totalBrands,
      detail: `${summary.activeBrands} con productos asignados`,
    },
    {
      title: "Bundles de oferta",
      value: summary.totalBundles,
      detail: `${summary.activeBundles} promociones vigentes`,
    },
    {
      title: "Variantes / Combinaciones",
      value: summary.totalVariants,
      detail: "Configuraciones totales registradas",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <AdminStatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="space-y-6">
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
    </div>
  );
}

export function AdminCatalogSection() {
  return <AdminCatalogSubroute subroute="productos" />;
}

export function AdminCatalogSubroute({ subroute }: { subroute: string }) {
  const [summary, setSummary] = useState<CatalogSummary>(EMPTY_SUMMARY);

  const fetchSummary = async () => {
    try {
      const [products, brands, bundles, attributeDefinitions] = await Promise.all([
        apiGet<AdminProduct[]>("/api/products"),
        apiGet<AdminBrand[]>("/api/brands"),
        apiGet<AdminBundle[]>("/api/bundles"),
        apiGet<AdminCatalogAttributeDefinition[]>("/api/catalog/attribute-definitions"),
      ]);

      const totalVariants = products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);

      setSummary({
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.active).length,
        rentalProducts: products.filter((p) => p.allowsRental).length,
        totalBrands: brands.length,
        activeBrands: brands.filter((b) => b.activo).length,
        totalBundles: bundles.length,
        activeBundles: bundles.filter((b) => b.active).length,
        totalAttributes: attributeDefinitions.length,
        activeAttributes: attributeDefinitions.filter((a) => a.active).length,
        totalVariants,
      });
    } catch (err) {
      console.error("Error fetching catalog summary:", err);
    }
  };

  useEffect(() => {
    void fetchSummary();
  }, []);

  const renderContent = () => {
    switch (subroute) {
      case "productos":
        return <AdminCatalogProductsSubroute />;
      case "marcas":
        return <AdminCatalogBrandsSubroute />;
      case "bundles":
        return <AdminCatalogBundlesSubroute />;
      case "atributos":
        return <AdminCatalogAttributesSubroute />;
      case "personalizaciones":
        return <AdminCatalogPersonalizationsSubroute />;
      default:
        return (
          <div className="rounded-[2rem] border border-dashed border-white/10 p-12 text-center">
            <PackageOpen className="mx-auto size-12 text-stone-700" />
            <h3 className="mt-4 text-lg font-medium text-white">Próximamente</h3>
            <p className="mt-2 text-stone-400">Esta vista de catálogo estará disponible pronto.</p>
          </div>
        );
    }
  };

  return (
    <AdminCatalogSharedLayout activeTab={subroute} summary={summary}>
      {renderContent()}
    </AdminCatalogSharedLayout>
  );
}
