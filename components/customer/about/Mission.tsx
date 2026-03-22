export const Mission = () => {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Misión */}
      <div className="border border-gray-300 px-10 py-6 flex flex-col gap-y-5 hover:border-primary transition-colors duration-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="size-10 text-primary"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M13 7L8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13m1-7l2-2m8 12l2-2m-3-3l4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4"
          />
        </svg>
        <h3 className="text-3xl font-semibold">
          Nuestra Misión
        </h3>
        <p className="text-gray-700">
          Nuestra misión es proporcionar productos de alta calidad y un servicio
          al cliente excepcional. Nos esforzamos por superar las expectativas de
          nuestros clientes y crear un impacto positivo en las comunidades en
          las que operamos.
        </p>
      </div>

      {/* Visión */}
      <div className="border border-gray-300 px-10 py-6 flex flex-col gap-y-5 hover:border-primary transition-colors duration-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="size-10 text-primary"
        >
          <path
            fill="currentColor"
            d="M20.172 6.75h-1.861l-4.566 4.564a1.874 1.874 0 1 1-1.06-1.06l4.565-4.565V3.828a.94.94 0 0 1 .275-.664l1.73-1.73a.25.25 0 0 1 .25-.063c.089.026.155.1.173.191l.46 2.301l2.3.46c.09.018.164.084.19.173a.25.25 0 0 1-.062.249l-1.731 1.73a.94.94 0 0 1-.663.275"
          />
          <path
            fill="currentColor"
            d="M2.625 12A9.375 9.375 0 0 0 12 21.375A9.375 9.375 0 0 0 21.375 12c0-.898-.126-1.766-.361-2.587A.75.75 0 0 1 22.455 9c.274.954.42 1.96.42 3c0 6.006-4.869 10.875-10.875 10.875S1.125 18.006 1.125 12S5.994 1.125 12 1.125c1.015-.001 2.024.14 3 .419a.75.75 0 1 1-.413 1.442A9.4 9.4 0 0 0 12 2.625A9.375 9.375 0 0 0 2.625 12"
          />
          <path
            fill="currentColor"
            d="M7.125 12a4.874 4.874 0 1 0 9.717-.569a.748.748 0 0 1 1.047-.798c.251.112.42.351.442.625a6.373 6.373 0 0 1-10.836 5.253a6.376 6.376 0 0 1 5.236-10.844a.75.75 0 1 1-.17 1.49A4.876 4.876 0 0 0 7.125 12"
          />
        </svg>
        <h3 className="text-3xl font-semibold">
          Nuestra Visión
        </h3>
        <p className="text-gray-700">
          Nuestra visión es ser líderes en nuestra industria, reconocidos por
          nuestra innovación, calidad y compromiso con la sostenibilidad.
          Buscamos crear un futuro mejor para nuestros clientes, empleados y el
          planeta.
        </p>
      </div>
    </div>
  );
};
