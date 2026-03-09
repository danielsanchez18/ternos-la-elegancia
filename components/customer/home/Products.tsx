"use client";

import { useState } from "react";
import { ProductCard, type Product } from "@/components/shared/ProductCard";

const initialProducts: Product[] = [
  {
    id: "traje-clasico-001",
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
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const toggleCart = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inCart: !p.inCart } : p))
    );
  };

  const toggleLike = (id: string) => {
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
