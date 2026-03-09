import { CategoryCard, type Category } from "@/components/shared/CategoryCard";

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
];

export const Collections = () => {
  return (
    <div className="bg-white space-y-15">
      {/* Título y Descripción */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-5xl font-oswald font-medium uppercase">
          Colecciones
        </h2>
        <p className="text-neutral-700 text-balance text-lg">
          Excelencia en cada detalle para el caballero moderno.
        </p>
      </div>

      {/* Galería de Colecciones */}
      <div className="grid grid-cols-5 gap-4">
        {collections.map((collection) => (
          <CategoryCard key={collection.id} category={collection} />
        ))}
      </div>

      {/* Boton de Ver Más */}
      <div className="text-center">
        <button className="btn-primary">Ver Todas las Colecciones</button>
      </div>
    </div>
  );
};
