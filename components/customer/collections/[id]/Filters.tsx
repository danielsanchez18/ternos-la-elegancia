export const Filters = () => {
  return (
    <div className="flex flex-col gap-y-5 w-70">
      <div className="pb-3 border-b border-gray-300">
        <p className="font-medium uppercase font-oswald text-2xl">Filtros</p>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="flex items-center gap-x-4">
          <input type="checkbox" id="filter1" className="min-w-5 h-5 cursor-pointer" />
          <label htmlFor="filter1" className="w-full leading-none text-lg cursor-pointer">Filtro 1</label>
          <span className="ml-auto text-gray-700">(10)</span>
        </div>
        
        <div className="flex items-center gap-x-4">
          <input type="checkbox" id="filter2" className="min-w-5 h-5 cursor-pointer" />
          <label htmlFor="filter2" className="w-full leading-none text-lg cursor-pointer">Filtro 2</label>
          <span className="ml-auto text-gray-700">(5)</span>
        </div>

        <div className="flex items-center gap-x-4">
          <input type="checkbox" id="filter3" className="min-w-5 h-5 cursor-pointer" />
          <label htmlFor="filter3" className="w-full leading-none text-lg cursor-pointer">Filtro 3</label>
          <span className="ml-auto text-gray-700">(8)</span>
        </div>
      </div>

      <div className="flex items-center gap-x-2">
        <button className="px-4 py-2 btn-primary transition w-full">Aplicar</button>
        <button className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 font-medium w-full transition">Limpiar</button>
      </div>

    </div>
  )
}