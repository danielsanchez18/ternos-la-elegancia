import Link from "next/link";
import Image from "next/image";

export type Category = {
  id: string;
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
      <div className="min-h-96 max-h-96 bg-black/10 overflow-hidden relative">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
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
