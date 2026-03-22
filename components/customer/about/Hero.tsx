import Image from "next/image";
import Image1 from "@/assets/images/ternos-hero.jpg";

export const Hero = () => {
  return (
    <div className="h-100 bg-black/80 overflow-hidden w-full relative">
      {/* Image background */}
      <div className="absolute inset-0 z-10">
        <Image
          src={Image1}
          alt="Fondo del hero"
          fill
          className="object-cover mask-b-from-50%"
        />
        <div className="size-full inset-0 z-20 absolute bg-linear-to-b from-black/60 to-black/50"></div>
      </div>

      {/* Contenido */}
      <div className="max-w-350 mx-auto h-full text-white flex flex-col items-center justify-center max-xl:px-4 space-y-8 z-20 absolute inset-0">
        <h1 className="text-8xl font-medium text-balance font-oswald uppercase">
          Nuestra historia
        </h1>
        <p className="text-2xl font-light">
          Elegancia hecha a medida en el corazón de Chiclayo.
        </p>
      </div>
    </div>
  );
};
