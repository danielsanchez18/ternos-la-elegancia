import Image from "next/image";
import UserJuan from "@/assets/images/user-juan.jpg";
import UserMaria from "@/assets/images/user-maria.jpg";
import UserFlor from "@/assets/images/user-flor.jpg";
import UserCarlos from "@/assets/images/user-carlos.jpg";
import TestimonialJuan from "@/assets/images/testimonial-juan.webp";
import TestimonialMaria from "@/assets/images/testimonial-maria.avif";
import TestimonialFlor from "@/assets/images/testimonial-flor.jpg";
import TestimonialCarlos from "@/assets/images/testimonial-carlos.webp";

export const Testimonials = () => {
  return (
    <section className="space-y-15 mx-auto">
      {/* Título y Descripción */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-5xl font-oswald font-medium uppercase">
          ¿Qué dicen nuestros clientes?
        </h2>
        <p className="text-neutral-700 text-balance text-lg">
          Descubre por qué nuestros clientes confían en nosotros para sus
          necesidades de transporte. Lee sus experiencias y opiniones sobre
          nuestro trabajo.
        </p>
      </div>

      {/* Testimonios */}
      <div className="grid grid-cols-4 gap-2">
        
        {/* Testimonio 1 */}
        <div className="bg-black/10 w-full h-full row-span-2 flex flex-col justify-end p-8 relative">
          <p className="text-white z-20">
            "Excelente servicio, puntualidad y atención al cliente. Recomiendo esta empresa a todos mis amigos y familiares."
          </p>
          <div className="flex items-center mt-6 space-x-4 z-20">
            <div className="rounded-full overflow-hidden bg-black/10 size-14">
              <Image
                src={UserJuan}
                alt="Tienda de Trajes"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white line-clamp-1">Juan Pérez</h3>
              <p className="text-sm text-white">Cliente desde 2020</p>
            </div>
          </div>
          <div className="absolute inset-0 size-full ">
            <Image
              src={TestimonialJuan}
              alt="Tienda de Trajes"
              fill
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="size-full inset-0 absolute bg-linear-to-tr from-black/80 to-black/50"></div>
          </div>
        </div>

        {/* Testimonio 2 */}
        <div className="bg-black/10 w-full h-55 text-end col-span-2 flex flex-col justify-end p-8 relative">
          
          <div className="flex items-center justify-end space-x-4 z-20">
            <div>
              <h3 className="text-lg font-semibold text-white line-clamp-1">María López</h3>
              <p className="text-sm text-white">Cliente desde 2019</p>
            </div>
            <div className="rounded-full overflow-hidden bg-black/10 size-14">
              <Image
                src={UserMaria}
                alt="Tienda de Trajes"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <p className="text-white mt-6 z-20">
            "Servicio de calidad y profesionalismo. Muy satisfecho con el trato recibido. Definitivamente volveré a contratar sus servicios en el futuro."
          </p>
          <div className="absolute inset-0 size-full ">
            <Image
              src={TestimonialMaria}
              alt="Tienda de Trajes"
              fill
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="size-full inset-0 absolute bg-linear-to-tl from-black/80 to-black/50"></div>
          </div>
        </div>
        
        {/* Testimonio 3 */}
        <div className="bg-black/10 w-full h-full row-span-2 flex flex-col justify-end p-8 relative">
          <p className="text-white z-20">
            "Excelente servicio, puntualidad y atención al cliente. Recomiendo esta empresa a todos mis amigos y familiares."
          </p>
          <div className="flex items-center mt-6 space-x-4 z-20">
            <div className="rounded-full overflow-hidden bg-black/10 size-14">
              <Image
                src={UserCarlos}
                alt="Tienda de Trajes"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white line-clamp-1">Carlos Rodríguez</h3>
              <p className="text-sm text-white">Cliente desde 2020</p>
            </div>
          </div>
          <div className="absolute inset-0 size-full ">
            <Image
              src={TestimonialCarlos}
              alt="Tienda de Trajes"
              fill
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="size-full inset-0 absolute bg-linear-to-tr from-black/80 to-black/50"></div>
          </div>
        </div>
        
        {/* Testimonio 4 */}
        <div className="bg-black/10 w-full h-55 col-span-2 flex flex-col justify-end p-8 relative">
          
          <div className="flex items-center space-x-4 z-20">
              <div className="rounded-full overflow-hidden bg-black/10 size-14">
                <Image
                  src={UserFlor}
                  alt="Tienda de Trajes"
                  className="w-full h-full object-cover"
                />
              </div>
            <div>
              <h3 className="text-lg font-semibold text-white line-clamp-1">Flor López</h3>
              <p className="text-sm text-white">Cliente desde 2019</p>
            </div>
          </div>
          <p className="text-white mt-6 z-20">
            "Servicio de calidad y profesionalismo. Muy satisfecho con el trato recibido. Definitivamente volveré a contratar sus servicios en el futuro."
          </p>
          <div className="absolute inset-0 size-full ">
            <Image
              src={TestimonialFlor}
              alt="Tienda de Trajes"
              fill
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="size-full inset-0 absolute bg-linear-to-tr from-black/80 to-black/50"></div>
          </div>
        </div>

      </div>
    </section>
  );
};
