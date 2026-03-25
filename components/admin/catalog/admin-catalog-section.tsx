"use client";

import { useEffect, useState } from "react";
import { Layers3, Package, RefreshCw, Tags } from "lucide-react";

import { apiGet } from "@/components/admin/catalog/api";
import {
  catalogPanel,
  CatalogSectionLinks,
  catalogStatCard,
} from "@/components/admin/catalog/catalog-ui";
import type {
  AdminBrand,
  AdminBundle,
  AdminCatalogAttributeDefinition,
  AdminProduct,
} from "@/components/admin/catalog/types";

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
};

function buildSummary(input: {
  products: AdminProduct[];
  brands: AdminBrand[];
  bundles: AdminBundle[];
  attributeDefinitions: AdminCatalogAttributeDefinition[];
}): CatalogSummary {
  const { products, brands, bundles, attributeDefinitions } = input;

  return {
    totalProducts: products.length,
    activeProducts: products.filter((product) => product.active).length,
    rentalProducts: products.filter((product) => product.allowsRental).length,
    totalBrands: brands.length,
    activeBrands: brands.filter((brand) => brand.activo).length,
    totalBundles: bundles.length,
    activeBundles: bundles.filter((bundle) => bundle.active).length,
    totalAttributes: attributeDefinitions.length,
    activeAttributes: attributeDefinitions.filter((definition) => definition.active)
      .length,
  };
}

export default function AdminCatalogSection() {
  const [summary, setSummary] = useState<CatalogSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [products, brands, bundles, attributeDefinitions] = await Promise.all([
        apiGet<AdminProduct[]>("/api/products"),
        apiGet<AdminBrand[]>("/api/brands"),
        apiGet<AdminBundle[]>("/api/bundles"),
        apiGet<AdminCatalogAttributeDefinition[]>(
          "/api/catalog/attribute-definitions"
        ),
      ]);

      setSummary(
        buildSummary({
          products,
          brands,
          bundles,
          attributeDefinitions,
        })
      );
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "No se pudo cargar el resumen de catalogo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshSummary();
  }, []);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {catalogStatCard({
          title: "Productos",
          value: summary.totalProducts,
          detail: `${summary.activeProducts} activos, ${summary.rentalProducts} para renta`,
        })}
        {catalogStatCard({
          title: "Marcas",
          value: summary.totalBrands,
          detail: `${summary.activeBrands} activas`,
        })}
        {catalogStatCard({
          title: "Bundles",
          value: summary.totalBundles,
          detail: `${summary.activeBundles} activos`,
        })}
        {catalogStatCard({
          title: "Atributos",
          value: summary.totalAttributes,
          detail: `${summary.activeAttributes} definiciones activas`,
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3">
              <Package className="size-5 text-emerald-200" strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Catalogo admin
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Modulos integrados
              </h2>
            </div>
          </div>

          <div className="mt-6">
            <CatalogSectionLinks />
          </div>
        </div>

        {catalogPanel({
          eyebrow: "Estado de integracion",
          title: "Frontend conectado a API",
          action: (
            <button
              onClick={() => void refreshSummary()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-stone-200 transition hover:bg-white/[0.06]"
              type="button"
            >
              <RefreshCw className="size-3.5" />
              Actualizar
            </button>
          ),
          children: (
            <div className="space-y-3">
              <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-stone-300">
                  <Layers3 className="size-4 text-cyan-300" />
                  <p className="text-sm">
                    Productos, marcas, bundles y atributos listos para operar desde
                    admin.
                  </p>
                </div>
              </article>
              <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-stone-300">
                  <Tags className="size-4 text-cyan-300" />
                  <p className="text-sm">
                    El flujo de renta consume este catalogo de forma directa.
                  </p>
                </div>
              </article>

              {isLoading ? (
                <p className="text-sm text-stone-500">Cargando resumen...</p>
              ) : null}
              {error ? (
                <p className="text-sm text-rose-300">
                  Error de integracion: {error}
                </p>
              ) : null}
            </div>
          ),
        })}
      </div>
    </section>
  );
}
