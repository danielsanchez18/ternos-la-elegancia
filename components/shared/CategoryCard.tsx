import Link from "next/link";

export const CategoryCard = () => {
  return (
    <Link href="/" className="overflow-hidden group hover:bg-gray-100">
      {/* Foto */}
      <div className="h-72 bg-black/10 overflow-hidden">
        {/* <img
              src="https://imgs.search.brave.com/vtc0mU4GKkbv1FIcRrktQJ8gfcZ9lwhRBBPBx9jZg3Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zLmFs/aWNkbi5jb20vQHNj/MDQva2YvSDY5ZWIx/MzFmMzliZjRjNTRi/ZGE1ZmU4NThlNzFj/NmYwTy5qcGdfMzAw/eDMwMC5qcGc"
              alt="Traje Clásico"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            /> */}
      </div>

      {/* Detalles */}
      <div className="p-4">
        <h3 className="text-xl font-semibold">Ternos</h3>
        <p className="text-neutral-700 text-sm line-clamp-2">
          Diseños exclusivos para ocasiones especiales.
        </p>
      </div>
    </Link>
  );
};
