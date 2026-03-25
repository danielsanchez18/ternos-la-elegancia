"use client";

import { useEffect, useState } from "react";

import { CategoryCard, type Category } from "@/components/shared/CategoryCard";
import { getStorefrontBundles } from "@/lib/storefront-api";

const COLLECTION_IMAGES = [
  "/images/cat-ternos.webp",
  "/images/cat-business.webp",
  "/images/cat-smooking.jpg",
  "/images/cat-casual.webp",
  "/images/cat-novios.jpg",
];

export const Collections = () => {
  const [collections, setCollections] = useState<Category[]>([]);
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCollections() {
      try {
        const response = await getStorefrontBundles();
        if (!isMounted) {
          return;
        }

        const mapped = response.map((bundle, index) => ({
          id: bundle.id,
          name: bundle.nombre,
          description:
            bundle.descripcion ??
            "Conjunto recomendado para ocasiones especiales.",
          image: COLLECTION_IMAGES[index % COLLECTION_IMAGES.length],
          slug: bundle.slug,
        }));

        setCollections(mapped);
        if (mapped.length === 0) {
          setLoadMessage("Aun no hay colecciones activas.");
        }
      } catch {
        if (isMounted) {
          setLoadError("No se pudieron cargar colecciones desde la API.");
        }
      }
    }

    void loadCollections();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-15 bg-white">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h2 className="text-5xl font-oswald font-medium uppercase">Colecciones</h2>
        <p className="text-balance text-lg text-neutral-700">
          Paquetes comerciales configurados desde el catalogo real.
        </p>
        {loadMessage ? <p className="text-sm text-neutral-600">{loadMessage}</p> : null}
        {loadError ? <p className="text-sm text-amber-700">{loadError}</p> : null}
      </div>

      {collections.length === 0 ? (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-4 py-12 text-center text-neutral-600">
          No hay colecciones para mostrar por ahora.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {collections.map((collection) => (
            <CategoryCard key={collection.id} category={collection} />
          ))}
        </div>
      )}

      <div className="text-center">
        <button className="btn-primary" type="button">
          Ver Todas las Colecciones
        </button>
      </div>
    </div>
  );
};

