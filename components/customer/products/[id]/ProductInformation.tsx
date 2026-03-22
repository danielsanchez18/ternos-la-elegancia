export const ProductInformation = () => {
  return (
    <div className="border-y border-gray-300 divide-y divide-gray-300">
      <button className="flex items-center p-4 w-full hover:bg-primary/5">
        <span className="uppercase font-medium">Información del producto</span>
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
      <p className="p-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas
        consequatur, voluptate quisquam cumque corporis deleniti, magnam
        voluptate quisquam cumque corporis deleniti, magnam voluptate quisquam
        cumque corporis deleniti, magnam voluptate quisquam cumque corporis
      </p>
      <button className="flex items-center p-4 w-full hover:bg-primary/5">
        <span className="uppercase font-medium">Cambios y devoluciones</span>
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
      <p className="p-4">
        Nos comprometemos a ofrecerte la mejor experiencia de compra. Si por
        alguna razón no estás completamente satisfecho con tu prenda, te
        ofrecemos un plazo de 7 días hábiles para realizar un cambio.
      </p>
    </div>
  );
};
