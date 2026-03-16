import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/logos/logo.svg";

export const Footer = () => {
  return (
    <section className=" w-full lg:p-4">
      <footer className="max-bg-blue-950 lg:rounded-2xl bg-blue-950 py-15 px-5 mx-auto">
        
        {/* Links y contacto */}
        <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-y-10 max-w-350 mx-auto gap-x-5 md:gap-x-10">
          <article className="flex flex-col gap-y-3 sm:col-span-3 md:col-span-1 mx-auto md:mx-0">
            <div className="flex items-center gap-x-2">
              <div className="size-12 rounded-full bg-white/10">
                <Image
                  src={Logo}
                  alt="Ternos La Elegancia Logo"
                />
              </div>
              <h2 className="text-xl font-medium font-oswald uppercase text-white">
                Ternos La Elegancia
              </h2>
            </div>

            <p className="text-white/80">
              Sastrería fina dedicada a la confección de ternos a medida con
              altos estándares de calidad en Chiclayo.
            </p>
          </article>

          <article className="text-sm flex flex-col max-sm:items-center uppercase w-fit mx-auto text-white/80 gap-y-3">
            <h3 className="uppercase mb-3 text-lg font-oswald">explorar</h3>
            <Link href="/" className="hover:text-white hover:underline w-fit">
              Inicio
            </Link>
            <Link
              href="/productos"
              className="hover:text-white hover:underline w-fit"
            >
              Productos
            </Link>
            <Link
              href="/proceso"
              className="hover:text-white hover:underline w-fit"
            >
              proceso
            </Link>
            <Link
              href="/nosotros"
              className="hover:text-white hover:underline w-fit"
            >
              Nosotros
            </Link>
            <Link
              href="/contacto"
              className="hover:text-white hover:underline w-fit"
            >
              contacto
            </Link>
          </article>

          <article className="text-sm flex flex-col text-white/80 max-sm:items-center w-fit mx-auto gap-y-3">
            <h3 className="uppercase mb-3 text-lg font-oswald">contacto</h3>

            <a
              href="/productos#foxrooms"
              className="hover:text-white hover:underline flex items-center gap-x-1 w-fit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="size-5"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                >
                  <path d="M15 10.5a3 3 0 1 1-6 0a3 3 0 0 1 6 0" />
                  <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0" />
                </g>
              </svg>
              <p>Leoncio Prado #942, Chiclayo</p>
            </a>
            <a
              href="https://wa.me/51960606442"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-x-1 hover:text-white hover:underline w-fit"
            >
              <svg className="w-5 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              +51 951 963 622
            </a>

            <div className="flex items-center gap-x-1 w-fit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="size-5"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                >
                  <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0" />
                  <path d="M12 7v5l3 3" />
                </g>
              </svg>
              <p>Lun - Sáb: 9:00 am - 8:00 pm</p>
            </div>

            <div className="flex items-center gap-x-1 w-fit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="size-5"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                >
                  <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0" />
                  <path d="M12 7v5l3 3" />
                </g>
              </svg>
              <p>Dom: 9:00 am - 12:30 pm</p>
            </div>
          </article>

          <article className="text-sm flex flex-col uppercase text-white/80 max-sm:items-center w-fit mx-auto gap-y-3">
            <h3 className="uppercase mb-3 text-lg font-oswald">síguenos</h3>

            <a
              href="/productos#foxrooms"
              className="hover:text-white hover:underline flex items-center gap-x-2 w-fit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="size-5"
              >
                <path
                  fill="currentColor"
                  d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02"
                />
              </svg>
              <p>Facebook</p>
            </a>
            <a
              href="/productos#foxrooms"
              className="hover:text-white hover:underline flex items-center gap-x-2 w-fit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="size-5"
              >
                <path
                  fill="currentColor"
                  d="M16 7a1 1 0 1 1 2 0a1 1 0 0 1-2 0"
                />
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M12 7.25a4.75 4.75 0 1 0 0 9.5a4.75 4.75 0 0 0 0-9.5M8.75 12a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0"
                  clipRule="evenodd"
                />
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M17.258 2.833a47.7 47.7 0 0 0-10.516 0c-2.012.225-3.637 1.81-3.873 3.832a46 46 0 0 0 0 10.67c.236 2.022 1.86 3.607 3.873 3.832a47.8 47.8 0 0 0 10.516 0c2.012-.225 3.637-1.81 3.873-3.832a46 46 0 0 0 0-10.67c-.236-2.022-1.86-3.607-3.873-3.832m-10.35 1.49a46.2 46.2 0 0 1 10.184 0c1.33.15 2.395 1.199 2.55 2.517a44.4 44.4 0 0 1 0 10.32a2.89 2.89 0 0 1-2.55 2.516a46.2 46.2 0 0 1-10.184 0a2.89 2.89 0 0 1-2.55-2.516a44.4 44.4 0 0 1 0-10.32a2.89 2.89 0 0 1 2.55-2.516"
                  clipRule="evenodd"
                />
              </svg>
              <p>Instagram</p>
            </a>
            <a
              href="/productos#foxrooms"
              className="hover:text-white hover:underline flex items-center gap-x-2 w-fit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="size-5"
              >
                <path
                  fill="currentColor"
                  d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48"
                />
              </svg>
              <p>Tiktok</p>
            </a>
          </article>
        </div>

        {/* Pie de página */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 mt-15 text-sm sm:text-base">
          <p className="text-center text-white/60">
            &copy; {new Date().getFullYear()} Ternos La Elegancia.
          </p>

          <div className="rounded-full size-1 bg-white/60"></div>
          <a
            href="/legal#terms"
            className="text-white/60 hover:underline hover:text-white text-nowrap"
          >
            Términos y Condiciones.
          </a>
          <div className="rounded-full size-1 bg-white/60"></div>
          <a
            href="/legal#privacity"
            className="text-white/60 hover:underline hover:text-white text-nowrap"
          >
            Política de privacidad.
          </a>
          <div className="rounded-full size-1 bg-white/60"></div>
          <a
            href="/legal#reclamations"
            className="text-white/60 hover:underline hover:text-white text-nowrap"
          >
            Libro de reclamaciones.
          </a>
        </div>
      
      </footer>
    </section>
  );
};
