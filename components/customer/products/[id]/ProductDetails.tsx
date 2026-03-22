export const ProductDetails = () => {
  return (
    <div className="flex flex-col gap-y-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-x-2 text-gray-700">
        <a href="/colecciones" className="hover:underline hover:text-black">
          Colecciones
        </a>
        <span>/</span>
        <a
          href="/colecciones/business-premium"
          className="hover:underline hover:text-black"
        >
          Casual Elegante
        </a>
        <span>/</span>
        <p className="text-black font-semibold">Traje Ejecutivo</p>
      </div>

      <div className="flex flex-col gap-y-5">
        {/* Nombre del Producto */}
        <h2 className="text-5xl font-medium uppercase">Traje Ejecutivo</h2>

        {/* Descripcion */}
        <p className="text-gray-700 leading-relaxed">
          Conjunto de inspiración safari contemporánea confeccionado en tejido
          ligero que combina frescura, funcionalidad y estilo. La camisa de
          manga corta con cinturón integrado define la silueta y aporta un aire
          estructurado, mientras que los bolsillos de parche en contraste y
          botones en tono natural realzan su carácter sofisticado. El short de
          corte limpio y relajado complementa el conjunto con equilibrio y
          comodidad. Una propuesta moderna y refinada, ideal para looks
          veraniegos con personalidad y elegancia.
        </p>

        {/* Color */}
        <div className="flex items-center gap-x-4">
          <p className="font-medium uppercase text-lg">Colores:</p>
          <div className="flex items-center gap-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-800 cursor-pointer border-2 border-gray-300"></div>
            <div className="w-6 h-6 rounded-full bg-blue-800 cursor-pointer border-2 border-gray-300"></div>
            <div className="w-6 h-6 rounded-full bg-green-800 cursor-pointer border-2 border-gray-300"></div>
          </div>
        </div>

        {/* Tallas */}
        <div className="flex items-center gap-x-4">
          <p className="font-medium uppercase text-lg">Tallas:</p>
          <div className="flex items-center gap-x-2">
            <button className="px-3 py-1 border border-gray-300 hover:border-primary transition">
              S
            </button>
            <button className="px-3 py-1 border border-gray-300 hover:border-primary transition">
              M
            </button>
            <button className="px-3 py-1 border border-gray-300 hover:border-primary transition">
              L
            </button>
            <button className="px-3 py-1 border border-gray-300 hover:border-primary transition">
              XL
            </button>
          </div>
        </div>

        {/* Calificación */}
        <div className="flex items-center gap-x-2">
          <p className="font-medium uppercase text-lg">Calificación:</p>
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
            className="lucide lucide-star-icon lucide-star text-yellow-500 fill-yellow-500 size-4"
          >
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
          </svg>
          <p className="text-gray-700 leading-none text-lg">4.5</p>
          <p className="font-medium leading-none text-lg">(120 reseñas)</p>
        </div>

        {/* Precio */}
        <p className="text-3xl font-semibold uppercase">$199.99</p>

        {/* Botón de Compra */}
        <div className="flex items-center gap-x-4">
          <button className="btn-primary text-lg transition">
            Confeccionar a Medida
          </button>
          <button className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 text-lg font-medium transition">
            Ir a Simulador
          </button>
        </div>
      </div>
    </div>
  );
};
