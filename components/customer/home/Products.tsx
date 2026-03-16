"use client";

import { useEffect, useState } from "react";
import { ProductCard, type Product } from "@/components/shared/ProductCard";
import { getStorefrontProducts } from "@/lib/storefront-api";

const fallbackProducts: Product[] = [
  {
    id: "traje-clasico-001",
    slug: "traje-clasico-001",
    name: "Traje Clásico",
    category: "Formal",
    description: "Un traje atemporal que combina elegancia y sofisticación.",
    price: 450,
    image: "/images/traje-elegante.jpg",
    inCart: false,
    liked: false,
  },
  {
    id: "traje-ejecutivo-002",
    slug: "traje-ejecutivo-002",
    name: "Traje Ejecutivo",
    category: "Business",
    description: "Diseñado para presencia profesional y confort diario.",
    price: 520,
    image: "/images/traje-ejecutivo.avif",
    inCart: false,
    liked: true,
  },
  {
    id: "smoking-nocturno-003",
    slug: "smoking-nocturno-003",
    name: "Smoking Nocturno",
    category: "Ceremonia",
    description: "Ideal para eventos de gala con acabado premium.",
    price: 780,
    image: "/images/smooking-nocturno.jpg",
    inCart: true,
    liked: false,
  },
  {
    id: "traje-moderno-004",
    slug: "traje-moderno-004",
    name: "Traje Moderno",
    category: "Casual Elegante",
    description: "Corte contemporáneo para un look versátil.",
    price: 490,
    image: "/images/traje-moderno.jpg",
    inCart: false,
    liked: false,
  },
];

export const Products = () => {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const response = await getStorefrontProducts();

        if (!isMounted || response.length === 0) {
          return;
        }

        setProducts(
          response.map((product) => ({
            id: product.id,
            slug: product.slug,
            name: product.nombre,
            category: product.kind,
            description: product.descripcion ?? "Descubre esta pieza dentro de nuestra coleccion.",
            price: Number(product.variants[0]?.salePrice ?? 0),
            image: product.images[0]?.url ?? "/images/traje-elegante.jpg",
            inCart: false,
            liked: product.isFeatured || product.isNew,
          }))
        );
      } catch {
        if (isMounted) {
          setLoadError(
            "Mostrando catalogo referencial mientras termina de configurarse la API."
          );
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
      prev.map((p) => (p.id === id ? { ...p, inCart: !p.inCart } : p))
    );
  };

  const toggleLike = (id: string | number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p))
    );
  };

  return (
    <div className="bg-white space-y-15">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-5xl font-oswald font-medium uppercase">
          nuestros productos
        </h2>
        <p className="text-neutral-700 text-balance text-lg">
          Descubre nuestra exclusiva colección de trajes a medida, diseñados
          para realzar tu elegancia y estilo.
        </p>
        {isLoading ? (
          <p className="text-sm text-neutral-500">Cargando productos desde la API...</p>
        ) : null}
        {loadError ? <p className="text-sm text-amber-700">{loadError}</p> : null}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onToggleCart={toggleCart}
            onToggleLike={toggleLike}
          />
        ))}
      </div>
    </div>
  );
};
