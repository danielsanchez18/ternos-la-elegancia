"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  getStorefrontProductBySlug,
  type StorefrontProduct,
} from "@/lib/storefront-api";

function formatMoney(value: string | number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "S/ 0.00";
  }
  return `S/ ${parsed.toFixed(2)}`;
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Slug invalido.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function loadProduct() {
      try {
        const response = await getStorefrontProductBySlug(slug);
        if (!isMounted) {
          return;
        }
        setProduct(response);
      } catch {
        if (isMounted) {
          setError("No se pudo cargar el detalle del producto.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const activeVariants = useMemo(
    () => product?.variants.filter((variant) => variant.active) ?? [],
    [product]
  );

  if (isLoading) {
    return (
      <section className="mx-auto max-w-350 px-4 py-16">
        <p className="text-sm text-neutral-600">Cargando detalle...</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="mx-auto max-w-350 px-4 py-16">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
          <p className="text-sm text-neutral-700">
            {error ?? "No encontramos este producto."}
          </p>
          <Link
            href="/productos"
            className="mt-4 inline-flex rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-100"
          >
            Volver a productos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-350 px-4 py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50">
          <img
            src={product.images[0]?.url ?? "/images/traje-elegante.jpg"}
            alt={product.images[0]?.altText ?? product.nombre}
            className="h-full w-full object-cover"
          />
        </article>

        <article className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            {product.kind}
          </p>
          <h1 className="text-4xl font-oswald uppercase text-neutral-950">
            {product.nombre}
          </h1>
          <p className="text-base leading-7 text-neutral-700">
            {product.descripcion ?? "Sin descripcion disponible."}
          </p>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm font-medium text-neutral-900">Variantes activas</p>
            {activeVariants.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-600">
                Este producto aun no tiene variantes activas.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {activeVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{variant.sku}</p>
                      <p className="text-neutral-600">
                        {[variant.talla, variant.tallaSecundaria]
                          .filter(Boolean)
                          .join(" / ") || "Sin talla"}
                      </p>
                    </div>
                    <p className="font-semibold text-neutral-900">
                      {formatMoney(variant.salePrice)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/productos"
            className="inline-flex rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-100"
          >
            Volver a productos
          </Link>
        </article>
      </div>
    </section>
  );
}

