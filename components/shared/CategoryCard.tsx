import Link from "next/link";

export type Category = {
  id: string | number;
  name: string;
  description: string;
  image: string;
  slug: string;
};

type CategoryCardProps = {
  category: Category;
};

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={`/colecciones/${category.slug}`} className="overflow-hidden group hover:bg-gray-100">
      {/* Foto */}
      <div className="h-72 bg-black/10 overflow-hidden relative">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Detalles */}
      <div className="p-4 space-y-1">
        <h3 className="text-xl font-semibold">{category.name}</h3>
        <p className="text-neutral-700 text-sm line-clamp-2">
          {category.description}
        </p>
      </div>
    </Link>
  );
};
