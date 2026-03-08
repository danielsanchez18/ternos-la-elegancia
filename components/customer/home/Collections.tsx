import { CategoryCard } from "@/components/shared/CategoryCard" 

export const Collections = () => {
  return (
    <div className='bg-white space-y-15'>
      
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
        <CategoryCard />
        <CategoryCard />
        <CategoryCard />
        <CategoryCard />
        <CategoryCard />
      </div>

      {/* Boton de Ver Más */}
      <div className="text-center">
        <button className="btn-primary">
          Ver Todas las Colecciones
        </button>
      </div>
    </div>
  )
}
