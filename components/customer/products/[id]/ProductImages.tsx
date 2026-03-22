import Image from "next/image";

export const ProductImages = () => {
  return (
    <>
      <div className="w-full grid grid-cols-4 gap-3">
        {/* Imagen Principal */}
        <div className="relative col-span-4 h-150 w-full bg-black/20 row-span-2">
          <Image
            src="/images/traje-ejecutivo.avif"
            alt="Imagen del producto"
            fill
            className="object-cover w-full h-full"
          />

          <div className="absolute top-0 inset-0 size-full">
            <p className="absolute inset-e-5 bottom-5 px-4 py-1 text-white bg-black/70 text-lg">1 / 4</p>
          </div>
        </div>

        {/* Imagenes Secundarias */}
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
        </div>
      </div>
    </>
  );
};
