import Image from "next/image";
import ImageVisit from "@/public/images/visit-us.jpg";

export const VisitUs = () => {
  return (
    <section className="grid grid-cols-2 gap-10 items-center max-w-300 mx-auto">
      {/* Imagen */}
      <div className="h-80 bg-black/10 overflow-hidden">
        <Image
          src={ImageVisit}
          alt="Tienda de Trajes"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="space-y-6">
        <h2 className="text-5xl font-oswald font-medium uppercase">
          Vísitanos
        </h2>

        <div className="space-y-2">
          <div className="flex items-center text-neutral-700 gap-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="size-6"
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
          </div>

          <div className="flex items-center text-neutral-700 gap-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="size-6"
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
            <p>Lun - Sáb: 9:00 am - 8:00 pm | Dom: 9:00 am - 12:30 pm</p>
          </div>

          <div className="flex items-center text-neutral-700 gap-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="size-6"
            >
              <path
                fill="currentColor"
                d="M18.4 20.75h-.23a16.7 16.7 0 0 1-7.27-2.58a16.6 16.6 0 0 1-5.06-5.05a16.7 16.7 0 0 1-2.58-7.29A2.3 2.3 0 0 1 3.8 4.1a2.32 2.32 0 0 1 1.6-.84H8a2.36 2.36 0 0 1 2.33 2a9.3 9.3 0 0 0 .53 2.09a2.37 2.37 0 0 1-.54 2.49l-.61.61a12 12 0 0 0 3.77 3.75l.61-.6a2.37 2.37 0 0 1 2.49-.54a9.6 9.6 0 0 0 2.09.53a2.35 2.35 0 0 1 2 2.38v2.4a2.36 2.36 0 0 1-2.35 2.36ZM8 4.75H5.61a.87.87 0 0 0-.61.31a.83.83 0 0 0-.2.62a15.2 15.2 0 0 0 2.31 6.62a15 15 0 0 0 4.59 4.59a15.34 15.34 0 0 0 6.63 2.36A.9.9 0 0 0 19 19a.88.88 0 0 0 .25-.61V16a.86.86 0 0 0-.74-.87a11.4 11.4 0 0 1-2.42-.6a.87.87 0 0 0-.91.19l-1 1a.76.76 0 0 1-.9.12a13.53 13.53 0 0 1-5.11-5.1a.74.74 0 0 1 .12-.9l1-1a.85.85 0 0 0 .19-.9a11.3 11.3 0 0 1-.6-2.42a.87.87 0 0 0-.88-.77"
              />
            </svg>
            <p>+51 995 744 047</p>
          </div>
        </div>

        {/* Boton de llamada a la acción */}
        <button className="btn-primary">Ver Ubicación</button>
      </div>
    </section>
  );
};
