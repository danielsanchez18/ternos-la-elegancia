import Image from "next/image";

export const ProductCard = () => {
  return (
    <button
      type="button"
      className="bg-gray-100 px-3 py-3 w-full hover:bg-gray-200 flex items-center gap-x-3"
    >
      {/* Foto del producto */}
      <div className="relative h-25 min-w-25 max-w-25 bg-white overflow-hidden">
        <Image
          src="/images/cat-casual.webp"
          alt="Nombre del producto"
          fill
          className="h-full w-full object-cover"
        />
      </div>

      {/* Detalles del producto */}
      <div className="w-full flex flex-col items-start">
        {/* Nombre del producto y colección */}
        <h3 className="font-medium line-clamp-1">Nombre del producto</h3>
        <p className="text-sm text-gray-700">Nombre de la colección</p>

        {/* Talla */}
        <div className="flex items-center gap-x-2 mt-2">
          <span className="text-sm font-medium">TALLA:</span>
          <button
            type="button"
            className="text-sm px-4 py-1.5 border border-gray-300 bg-white"
          >
            Personalizada
          </button>
        </div>
      </div>

      <div className="w-full flex items-center justify-between gap-x-3">
        {/* Cantidad */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium">Cantidad</span>
          <div className="flex items-center gap-x-1">
            <button
              type="button"
              className="text-sm px-3 py-1.5 border border-gray-300 bg-white"
            >
              -
            </button>
            <p className="w-8 text-center">1</p>
            <button
              type="button"
              className="text-sm px-3 py-1.5 border  border-gray-300 bg-white"
            >
              +
            </button>
          </div>
        </div>

        {/* Precio total y precio unitario */}
        <div className="flex flex-col items-end">
          <span className="text-lg font-medium py-0.5">S/.19.99</span>
          <span className="text-xs text-gray-700">UNI: S/.19.99</span>
        </div>

        {/* Quitar producto */}
        <button
          type="button"
          className="text-sm px-1 py-1 text-gray-700 border border-gray-300 bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x-icon lucide-x size-5"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </button>
  );
};
