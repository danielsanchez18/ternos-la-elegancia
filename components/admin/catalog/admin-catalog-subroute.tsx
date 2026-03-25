import { PackageOpen } from "lucide-react";

import AdminCatalogSectionView from "@/components/admin/catalog/admin-catalog-section";
import AdminCatalogProductsSubroute from "@/components/admin/catalog/admin-catalog-products-subroute";
import AdminCatalogBrandsSubroute from "@/components/admin/catalog/admin-catalog-brands-subroute";
import AdminCatalogBundlesSubroute from "@/components/admin/catalog/admin-catalog-bundles-subroute";
import AdminCatalogAttributesSubroute from "@/components/admin/catalog/admin-catalog-attributes-subroute";
import AdminCatalogPersonalizationsSubroute from "@/components/admin/catalog/admin-catalog-personalizations-subroute";

export function AdminCatalogSection() {
  return <AdminCatalogSectionView />;
}

export function AdminCatalogSubroute({ subroute }: { subroute: string }) {
  if (subroute === "productos") {
    return <AdminCatalogProductsSubroute />;
  }

  if (subroute === "marcas") {
    return <AdminCatalogBrandsSubroute />;
  }

  if (subroute === "bundles") {
    return <AdminCatalogBundlesSubroute />;
  }

  if (subroute === "atributos") {
    return <AdminCatalogAttributesSubroute />;
  }

  if (subroute === "personalizaciones") {
    return <AdminCatalogPersonalizationsSubroute />;
  }

  return (
    <div className="rounded-[2rem] border border-dashed border-white/10 p-12 text-center">
      <PackageOpen className="mx-auto size-12 text-stone-700" />
      <h3 className="mt-4 text-lg font-medium text-white">Proximamente</h3>
      <p className="mt-2 text-stone-400">
        Esta vista de catalogo estara disponible pronto.
      </p>
    </div>
  );
}
