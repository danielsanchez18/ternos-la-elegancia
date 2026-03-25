"use client";

import { useEffect, useState } from "react";

import { ProductCard, type Product } from "@/components/shared/ProductCard";
import { getStorefrontProducts } from "@/lib/storefront-api";

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const response = await getStorefrontProducts();
        if (!isMounted) {
          return;
        }

        const mapped = response.map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.nombre,
          category: product.kind,
          description:
            product.descripcion ?? "Descubre esta pieza dentro de nuestra coleccion.",
          price: Number(product.variants[0]?.salePrice ?? 0),
          image: product.images[0]?.url ?? "/images/traje-elegante.jpg",
          inCart: false,
          liked: product.isFeatured || product.isNew,
        }));

        setProducts(mapped);
        if (mapped.length === 0) {
          setInfoMessage("Aun no hay productos activos en catalogo.");
        }
      } catch {
        if (isMounted) {
          setLoadError("No se pudieron cargar productos desde la API.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleCart = (id: string | number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, inCart: !product.inCart } : product
      )
    );
  };

  const toggleLike = (id: string | number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, liked: !product.liked } : product
      )
    );
  };

  return (
    <div className="space-y-15 bg-white">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h2 className="text-5xl font-oswald font-medium uppercase">
          nuestros productos
        </h2>
        <p className="text-balance text-lg text-neutral-700">
          Descubre nuestra exclusiva coleccion de ternos y prendas para venta
          directa.
        </p>
        {isLoading ? (
          <p className="text-sm text-neutral-500">Cargando productos desde la API...</p>
        ) : null}
        {infoMessage ? <p className="text-sm text-neutral-600">{infoMessage}</p> : null}
        {loadError ? <p className="text-sm text-amber-700">{loadError}</p> : null}
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-4 py-12 text-center text-neutral-600">
          No hay productos para mostrar por ahora.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleCart={toggleCart}
              onToggleLike={toggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
};

