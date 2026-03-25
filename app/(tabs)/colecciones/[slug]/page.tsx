"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  getStorefrontBundleBySlug,
  type StorefrontBundle,
} from "@/lib/storefront-api";

function formatMoney(value: string | number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "S/ 0.00";
  }
  return `S/ ${parsed.toFixed(2)}`;
}

export default function CollectionDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [bundle, setBundle] = useState<StorefrontBundle | null>(null);
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

    async function loadBundle() {
      try {
        const response = await getStorefrontBundleBySlug(slug);
        if (!isMounted) {
          return;
        }

        if (!response) {
          setError("No encontramos esta coleccion.");
          return;
        }

        setBundle(response);
      } catch {
        if (isMounted) {
          setError("No se pudo cargar el detalle de la coleccion.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBundle();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const itemCount = useMemo(() => {
    if (!bundle) {
      return 0;
    }
    return (bundle.items?.length ?? 0) + (bundle.variantItems?.length ?? 0);
  }, [bundle]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-350 px-4 py-16">
        <p className="text-sm text-neutral-600">Cargando coleccion...</p>
      </section>
    );
  }

  if (error || !bundle) {
    return (
      <section className="mx-auto max-w-350 px-4 py-16">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
          <p className="text-sm text-neutral-700">
            {error ?? "No encontramos esta coleccion."}
          </p>
          <Link
            href="/colecciones"
            className="mt-4 inline-flex rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-100"
          >
            Volver a colecciones
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-350 px-4 py-16">
      <article className="rounded-3xl border border-neutral-200 bg-white p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Coleccion</p>
        <h1 className="mt-3 text-4xl font-oswald uppercase text-neutral-950">
          {bundle.nombre}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          {bundle.descripcion ?? "Sin descripcion disponible."}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Precio</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {formatMoney(bundle.price)}
            </p>
          </article>
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Estado</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {bundle.active ? "Activo" : "Inactivo"}
            </p>
          </article>
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Items</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{itemCount}</p>
          </article>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-sm font-medium text-neutral-900">Productos del bundle</p>
            {bundle.items && bundle.items.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {bundle.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-neutral-200 px-3 py-2"
                  >
                    {item.product.nombre} x{item.quantity}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-neutral-600">Sin items de producto.</p>
            )}
          </article>

          <article className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-sm font-medium text-neutral-900">Variantes del bundle</p>
            {bundle.variantItems && bundle.variantItems.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {bundle.variantItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-neutral-200 px-3 py-2"
                  >
                    {item.variant.product.nombre} / {item.variant.sku} x{item.quantity}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-neutral-600">Sin items de variante.</p>
            )}
          </article>
        </div>

        <Link
          href="/colecciones"
          className="mt-6 inline-flex rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-100"
        >
          Volver a colecciones
        </Link>
      </article>
    </section>
  );
}

