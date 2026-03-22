import { Category, CategoryCard } from "@/components/shared/CategoryCard";

const collections: Category[] = [
  {
    id: "col-001",
    name: "Ternos Clásicos",
    description: "Elegancia atemporal para ocasiones formales.",
    image: "/images/cat-ternos.webp",
    slug: "ternos-clasicos",
  },
  {
    id: "col-002",
    name: "Business Premium",
    description: "Diseños ejecutivos para el profesional moderno.",
    image: "/images/cat-business.webp",
    slug: "business-premium",
  },
  {
    id: "col-003",
    name: "Smoking & Gala",
    description: "Perfectos para eventos especiales y ceremonias.",
    image: "/images/cat-smooking.jpg",
    slug: "smoking-gala",
  },
  {
    id: "col-004",
    name: "Casual Elegante",
    description: "Versatilidad y estilo para el día a día.",
    image: "/images/cat-casual.webp",
    slug: "casual-elegante",
  },
  {
    id: "col-005",
    name: "Novios",
    description: "Colección exclusiva para el día más importante.",
    image: "/images/cat-novios.jpg",
    slug: "novios",
  },
  {
    id: "col-006",
    name: "Accesorios",
    description: "Complementos para un look completo y sofisticado.",
    image: "/images/cat-ternos.webp",
    slug: "accesorios",
  },
  {
    id: "col-007",
    name: "Ternos de Verano",
    description: "Frescos y ligeros para los días más cálidos.",
    image: "/images/cat-casual.webp",
    slug: "ternos-de-verano",
  },
  {
    id: "col-008",
    name: "Ternos de Invierno",
    description: "Calidez y estilo para la temporada fría.",
    image: "/images/cat-novios.jpg",
    slug: "ternos-de-invierno",
  }
];

export const GridCollections = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {collections.map((collection) => (
        <CategoryCard key={collection.id} category={collection} />
      ))}
    </div>
  )
}
