"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/logos/logo.svg";

export const Navbar = () => {
  return (
    <nav className="max-w-350 mx-auto max-xl:px-4">
      <div className="w-full flex items-center py-2">
        
        {/* TODO: Cambiar Logo */}
        <a href="/" className="flex items-center gap-x-2" aria-label="Logo de la empresa" title="Ir a la página de inicio">
          <div className="size-10 bg-black/50 rounded-full">
            <Image src={Logo} alt="Logo" width={40} height={40} className="rounded-full" />
          </div>
        </a>

        <div className="w-px h-5 mx-4 rotate-20 bg-black"></div>

        {/* Links de navegación */}
        <div className="flex items-center justify-end uppercase">
          <Link
            href="/"
            className="px-4 py-4 text-neutral-900 hover:text-neutral-600 hover:bg-neutral-100"
          >
            Inicio
          </Link>
          <Link
            href="/colecciones"
            className="px-4 py-4 text-neutral-900 hover:text-neutral-600 hover:bg-neutral-100"
          >
            Colecciones
          </Link>
          <Link
            href="/proceso"
            className="px-4 py-4 text-neutral-900 hover:text-neutral-600 hover:bg-neutral-100"
          >
            Proceso
          </Link>
          <Link
            href="/nosotros"
            className="px-4 py-4 text-neutral-900 hover:text-neutral-600 hover:bg-neutral-100"
          >
            Nosotros
          </Link>
          <Link
            href="/contacto"
            className="px-4 py-4 text-neutral-900 hover:text-neutral-600 hover:bg-neutral-100"
          >
            Contacto
          </Link>
        </div>

        {/* Botones (Carrito, Buscar, Usuario) */}
        <div className="flex items-center ml-auto">
          {/* Buscar */}
          <button className="p-4 text-neutral-900 hover:bg-neutral-100 hover:text-neutral-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search-icon lucide-search size-6"
            >
              <path d="m21 21-4.34-4.34" />
              <circle cx="11" cy="11" r="8" />
            </svg>
          </button>

          {/* Carrito */}
          <button className="p-4 text-neutral-900 hover:bg-neutral-100 hover:text-neutral-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="size-6"
            >
              <path
                fill="currentColor"
                d="M15 11a1 1 0 1 0 0-2a1 1 0 0 0 0 2m-5-1a1 1 0 1 1-2 0a1 1 0 0 1 2 0"
              />
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M8.25 5.276V5a3.75 3.75 0 1 1 7.5 0v.276c.658.02 1.245.057 1.765.122c1.201.152 2.174.47 2.925 1.204q.376.368.664.81c.572.88.694 1.896.607 3.104c-.086 1.182-.382 2.666-.759 4.549l-.02.095c-.26 1.307-.468 2.347-.726 3.166c-.265.842-.604 1.524-1.17 2.076q-.293.285-.63.516c-.652.447-1.387.645-2.265.74c-.853.092-1.913.092-3.246.092h-1.79c-1.333 0-2.393 0-3.246-.092c-.878-.095-1.613-.293-2.265-.74a5 5 0 0 1-.63-.516c-.566-.552-.905-1.234-1.17-2.076c-.257-.819-.465-1.859-.727-3.166l-.019-.095c-.376-1.883-.673-3.367-.758-4.549c-.088-1.208.034-2.224.606-3.104a4.8 4.8 0 0 1 .664-.81c.752-.734 1.724-1.052 2.925-1.204c.52-.065 1.107-.102 1.765-.122M9.75 5a2.25 2.25 0 0 1 4.5 0v.252q-.636-.002-1.344-.002h-1.811q-.709 0-1.345.002zM4.608 7.675c.415-.405 1.008-.655 2.065-.789c1.07-.135 2.49-.136 4.476-.136h1.703c1.986 0 3.404.001 4.475.136c1.057.134 1.65.384 2.065.789q.257.252.454.554c.316.486.445 1.117.369 2.18c-.078 1.076-.355 2.467-.744 4.415c-.272 1.359-.465 2.32-.696 3.051c-.225.717-.465 1.14-.786 1.453a3.3 3.3 0 0 1-.43.353c-.37.253-.832.405-1.579.486c-.763.082-1.743.083-3.129.083H11.15c-1.386 0-2.366-.001-3.13-.083c-.746-.08-1.207-.233-1.577-.486a3.3 3.3 0 0 1-.431-.354c-.321-.312-.56-.735-.786-1.452c-.23-.732-.424-1.692-.695-3.051c-.39-1.948-.667-3.34-.744-4.416c-.077-1.062.052-1.693.368-2.179a3.3 3.3 0 0 1 .454-.554"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Usuario */}
          <button className="p-4 text-neutral-900 hover:bg-neutral-100 hover:text-neutral-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="size-6"
            >
              <g fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="6" r="4" />
                <path d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5Z" />
              </g>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};
