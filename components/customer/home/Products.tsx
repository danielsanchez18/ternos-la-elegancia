import { ProductCard } from '@/components/shared/ProductCard';

export const Products = () => {
  return (
    <div className="bg-white space-y-15">
      {/* Título y Descripción */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-5xl font-oswald font-medium uppercase">
          Nuestros Productos
        </h2>
        <p className="text-neutral-700 text-balance text-lg">
          Descubre nuestra exclusiva colección de trajes a medida, diseñados
          para realzar tu elegancia y estilo.
        </p>
      </div>

      {/* Galería de Productos destacados/más vendidos */}
      <div className="grid grid-cols-4 gap-4">
        
        {/* Producto 1 */}
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />

      </div>
    </div>
  );
};
