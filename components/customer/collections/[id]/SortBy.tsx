export const SortBy = () => {
  return (
    <div className="flex flex-col gap-y-5 w-70">
      <div className="pb-3 border-b border-gray-300">
        <p className="font-medium uppercase font-oswald text-2xl">Ordenar por</p>
      </div>

      <div className="flex flex-col gap-y-5">
        
        {/* Mas Popular */}
        <div className="flex items-center gap-x-4">
          <input type="radio" name="sort" id="sort4" className="min-w-5 h-5 rounded-full cursor-pointer checked:bg-blue-500 checked:border-blue-500" />
          <label htmlFor="sort4" className="w-full leading-none text-lg cursor-pointer">Más Popular</label>
        </div>

        <div className="flex items-center gap-x-4">
          <input type="radio" name="sort" id="sort1" className="min-w-5 h-5 rounded-full cursor-pointer checked:bg-blue-500 checked:border-blue-500" />
          <label htmlFor="sort1" className="w-full leading-none text-lg cursor-pointer">Precio: Más Barato</label>
        </div>

        <div className="flex items-center gap-x-4">
          <input type="radio" name="sort" id="sort2" className="min-w-5 h-5 rounded-full cursor-pointer checked:bg-blue-500 checked:border-blue-500" />
          <label htmlFor="sort2" className="w-full leading-none text-lg cursor-pointer">Precio: Más Caro</label>
        </div>

        <div className="flex items-center gap-x-4">
          <input type="radio" name="sort" id="sort3" className="min-w-5 h-5 rounded-full cursor-pointer checked:bg-blue-500 checked:border-blue-500" />
          <label htmlFor="sort3" className="w-full leading-none text-lg cursor-pointer">Nombre: A-Z</label>
        </div>

      </div>

    </div>
  )
}