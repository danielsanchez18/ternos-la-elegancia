const filters = [
  {
    name: "Categorías",
    type: "checkbox",
    categories: [
      {
        name: "Trajes",
        value: "trajes",
      },
      {
        name: "Camisas",
        value: "camisas",
      },
      {
        name: "Corbatas",
        value: "corbatas",
      },
      {
        name: "Pantalones",
        value: "pantalones",
      },
      {
        name: "Zapatos",
        value: "zapatos",
      },
      {
        name: "Accesorios",
        value: "accesorios",
      },
    ],
  },
  {
    name: "Tipo de Tela",
    type: "checkbox",
    categories: [
      {
        name: "Algodón",
        value: "algodon",
      },
      {
        name: "Lino",
        value: "lino",
      },
      {
        name: "Seda",
        value: "seda",
      },
    ],
  },
  {
    name: "Marcas",
    type: "checkbox",
    categories: [
      {
        name: "Armani",
        value: "armani",
      },
      {
        name: "Gucci",
        value: "gucci",
      },
      {
        name: "Ralph Lauren",
        value: "ralph-lauren",
      },
      {
        name: "Prada",
        value: "prada",
      },
      {
        name: "Hugo Boss",
        value: "hugo-boss",
      },
    ],
  },
  {
    name: "Rango de Precios",
    type: "checkbox",
    categories: [
      {
        name: "$0 - $100",
        value: "0-100",
      },
      {
        name: "$100 - $300",
        value: "100-300",
      },
      {
        name: "$300 - $500",
        value: "300-500",
      },
      {
        name: "$500 - $1000",
        value: "500-1000",
      },
      {
        name: "$1000+",
        value: "1000-plus",
      },
    ],
  },
];

export const Filters = () => {
  return (
    <div className="flex flex-col gap-y-10 w-70">
      {/* Renderizar Filtros */}
      <div className="flex flex-col gap-y-10">
        {filters.map((filter, index) => (
          <div key={index} className="flex flex-col gap-y-4">
            <button className="flex items-center uppercase pb-3 border-b border-gray-300 gap-x-2">
              {/* Nombre del filtro */}
              <p className="font-medium font-oswald text-2xl">
                {filter.name}
              </p>
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
                className="lucide lucide-chevron-down-icon lucide-chevron-down ml-auto"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Categorías del filtro */}
            {filter.categories.map((category, catIndex) => (
              <div key={catIndex} className="flex items-center gap-x-4">
                <input
                  type="checkbox"
                  id={`${filter.name}-${category.value || catIndex}`}
                  className="min-w-5 h-5 cursor-pointer"
                />
                <label
                  htmlFor={`${filter.name}-${category.value || catIndex}`}
                  className="w-full leading-none text-lg cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-x-2">
        <button className="px-4 py-2 btn-primary transition w-full">
          Aplicar
        </button>
        <button className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 font-medium w-full transition">
          Limpiar
        </button>
      </div>
    </div>
  );
};
