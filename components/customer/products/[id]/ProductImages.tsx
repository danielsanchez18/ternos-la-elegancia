import Image from "next/image";

export const ProductImages = () => {
  return (
    <>
      <div className="w-full grid grid-cols-3 gap-3">
        {/* Imagen Principal */}
        <div className="relative col-span-3 h-150 w-full bg-black/20 row-span-2">
          <Image
            src="/images/traje-ejecutivo.avif"
            alt="Imagen del producto"
            fill
            className="object-cover w-full h-full"
          />
        </div>

        {/* Imagenes Secundarias */}
        {/* <div className="relative h-40 w-full bg-black/20">
          <Image
            src="/images/traje-ejecutivo.avif"
            alt="Imagen del producto"
            fill
            className="object-cover w-full h-full"
          />
        </div>
        <div className="relative h-40 w-full bg-black/20">
          <Image
            src="/images/traje-ejecutivo.avif"
            alt="Imagen del producto"
            fill
            className="object-cover w-full h-full"
          />
        </div>
        <div className="relative h-40 w-full bg-black/20">
          <Image
            src="/images/traje-ejecutivo.avif"
            alt="Imagen del producto"
            fill
            className="object-cover w-full h-full"
          />
        </div> */}
      </div>
    </>
  );
};
