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
  {
    id: "traje-moderno-005",
    name: "Traje Moderno",
    category: "Casual Elegante",
    description: "Corte contemporáneo para un look versátil.",
    price: 490,
    image: "/images/smooking-nocturno.jpg",
    inCart: false,
    liked: false,
  },
  {
    id: "traje-moderno-006",
    name: "Traje Moderno",
    category: "Casual Elegante",
    description: "Corte contemporáneo para un look versátil.",
    price: 490,
    image: "/images/traje-elegante.jpg",
    inCart: false,
    liked: false,
  },
  {
    id: "traje-moderno-007",
    name: "Traje Moderno",
    category: "Casual Elegante",
    description: "Corte contemporáneo para un look versátil.",
    price: 490,
    image: "/images/traje-moderno.jpg",
    inCart: false,
    liked: false,
  },
  {
    id: "traje-moderno-008",
    name: "Traje Moderno",
    category: "Casual Elegante",
    description: "Corte contemporáneo para un look versátil.",
    price: 490,
    image: "/images/smooking-nocturno.jpg",
    inCart: false,
    liked: false,
  },
  {
    id: "traje-moderno-009",
    name: "Traje Moderno",
    category: "Casual Elegante",
    description: "Corte contemporáneo para un look versátil.",
    price: 490,
    image: "/images/traje-elegante.jpg",
    inCart: false,
    liked: false,
  }
];

export const ProductsGrid = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const toggleCart = (id: string) => {
    setProducts(products.map((product) => 
      product.id === id ? { ...product, inCart: !product.inCart } : product
    ));
  };

  const toggleLike = (id: string) => {
    setProducts(products.map((product) => 
      product.id === id ? { ...product, liked: !product.liked } : product
    ));
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-3 gap-5">
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
  )
}