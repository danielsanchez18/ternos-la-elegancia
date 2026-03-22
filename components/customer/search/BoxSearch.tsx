export const BoxSearch = () => {
  return (
    <div className="flex items-center gap-x-2">
        <div className="relative w-full group">
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
                className="text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2 size-5 lucide lucide-search-icon lucide-search group-hover:text-primary"
            >
                <path d="m21 21-4.34-4.34" />
                <circle cx="11" cy="11" r="8" />
            </svg>
            <input
                type="text"
                placeholder="Buscar traje, camisas, corbatas, etc"
                className="w-full pl-12 py-3 leading-none text-lg border border-gray-400 hover:border-primary"
            />
        </div>
        <button className="btn-primary text-lg py-3.5! leading-none px-6!">
            Buscar
        </button>
    </div>
  );
};