import Link from "next/link";

export type Product = {
  id: string | number;
  slug?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  inCart: boolean;
  liked: boolean;
};

type ProductCardProps = {
  product: Product;
  onToggleCart: (id: string | number) => void;
  onToggleLike: (id: string | number) => void;
};

export const ProductCard = ({
  product,
  onToggleCart,
  onToggleLike,
}: ProductCardProps) => {
  const productHref = product.slug ? `/productos/${product.slug}` : `/productos/${product.id}`;

  return (
    <article className="overflow-hidden group flex flex-col">
      <Link href={productHref} className="flex flex-col">
        <div className="h-72 bg-black/10 overflow-hidden relative">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        <div className="p-4 space-y-1">
          <p className="text-xs uppercase tracking-wide text-neutral-700">
            {product.category}
          </p>
          <h3 className="text-xl font-semibold line-clamp-1">{product.name}</h3>
          <p className="text-neutral-700 text-sm line-clamp-2">
            {product.description}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4 mt-auto flex items-center gap-x-2">
        <button
          type="button"
          onClick={() => onToggleCart(product.id)}
          className={`mr-auto px-4 py-2 text-sm font-medium border transition-colors ${
            product.inCart ? "bg-black text-white border-black" : "btn-primary"
          }`}
        >
          {product.inCart ? "En carrito" : "Agregar"}{" "}
          <span>S/. {product.price.toFixed(2)}</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleLike(product.id)}
          className={`border py-2 px-2 transition-colors z-50 ${
            product.liked
              ? "border-primary text-primary"
              : "border-black text-black hover:bg-gray-200"
          }`}
          aria-label={product.liked ? "Quitar like" : "Dar like"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className={`w-5 h-5 fill-current 
              ${product.liked ? "stroke-primary fill-primary" : "stroke-red-500 fill-transparent"}
            `}
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M16.696 3C14.652 3 12.887 4.197 12 5.943C11.113 4.197 9.348 3 7.304 3C4.374 3 2 5.457 2 8.481s1.817 5.796 4.165 8.073S12 21 12 21s3.374-2.133 5.835-4.446C20.46 14.088 22 11.514 22 8.481S19.626 3 16.696 3"
            />
          </svg>
        </button>
      </div>
    </article>
  );
};
