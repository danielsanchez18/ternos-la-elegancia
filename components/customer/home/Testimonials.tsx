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
        <div className="bg-black/10 w-full h-full row-span-2 flex flex-col justify-end p-8">
          <p className="text-neutral-700">
            "Excelente servicio, puntualidad y atención al cliente. Recomiendo esta empresa a todos mis amigos y familiares."
          </p>
          <div className="flex items-center mt-6 space-x-4">
            <div className="rounded-full bg-black/10 size-14"></div>
            <div>
              <h3 className="text-lg font-semibold line-clamp-1">Juan Pérez</h3>
              <p className="text-sm text-neutral-700">Cliente desde 2020</p>
            </div>
          </div>
        </div>

        {/* Testimonio 2 */}
        <div className="bg-black/10 w-full h-55 text-end col-span-2 flex flex-col justify-end p-8">
          
          <div className="flex items-center justify-end space-x-4">
            <div>
              <h3 className="text-lg font-semibold line-clamp-1">María López</h3>
              <p className="text-sm text-neutral-700">Cliente desde 2019</p>
            </div>
            <div className="rounded-full bg-black/10 size-14"></div>
          </div>
          <p className="text-neutral-700 mt-6">
            "Servicio de calidad y profesionalismo. Muy satisfecho con el trato recibido. Definitivamente volveré a contratar sus servicios en el futuro."
          </p>
        </div>
        
        {/* Testimonio 3 */}
        <div className="bg-black/10 w-full h-full row-span-2 flex flex-col justify-end p-8">
          <p className="text-neutral-700">
            "Excelente servicio, puntualidad y atención al cliente. Recomiendo esta empresa a todos mis amigos y familiares."
          </p>
          <div className="flex items-center mt-6 space-x-4">
            <div className="rounded-full bg-black/10 size-14"></div>
            <div>
              <h3 className="text-lg font-semibold line-clamp-1">Juan Pérez</h3>
              <p className="text-sm text-neutral-700">Cliente desde 2020</p>
            </div>
          </div>
        </div>
        
        {/* Testimonio 4 */}
        <div className="bg-black/10 w-full h-55 col-span-2 flex flex-col justify-end p-8">
          
          <div className="flex items-center space-x-4">
              <div className="rounded-full bg-black/10 size-14"></div>
            <div>
              <h3 className="text-lg font-semibold line-clamp-1">María López</h3>
              <p className="text-sm text-neutral-700">Cliente desde 2019</p>
            </div>
          </div>
          <p className="text-neutral-700 mt-6">
            "Servicio de calidad y profesionalismo. Muy satisfecho con el trato recibido. Definitivamente volveré a contratar sus servicios en el futuro."
          </p>
        </div>

      </div>
    </section>
  );
};
