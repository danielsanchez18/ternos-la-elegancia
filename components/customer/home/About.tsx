export const About = () => {
  return (
    <section className='grid grid-cols-2 gap-10 items-center'>

      {/* Imagen */}
      <div className='h-96 bg-black/10 overflow-hidden'>
        {/* <img
          src="https://imgs.search.brave.com/vtc0mU4GKkbv1FIcRrktQJ8gfcZ9lwhRBBPBx9jZg3Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zLmFs/aWNkbi5jb20vQHNj/MDQva2YvSDY5ZWIx/MzFmMzliZjRjNTRi/ZGE1ZmU4NThlNzFj/NmYwTy5qcGdfMzAw/eDMwMC5qcGc"
          alt="Tienda de Trajes"
          className="w-full h-full object-cover"
        /> */}
      </div>

      {/* Contenido */}
      <div className='space-y-6'>
        <h2 className='text-5xl font-oswald font-medium uppercase'>Sobre Nosotros</h2>
        <p className='text-neutral-700 text-balance'>
          En Ternos La Elegnacia nos apasiona crear prendas que
          reflejen la elegancia y el estilo de cada cliente. Con años de
          experiencia en la industria de la moda, ofrecemos una amplia gama de
          trajes personalizados para hombres y mujeres. Nuestro equipo de
          diseñadores y sastres expertos trabaja estrechamente contigo para
          garantizar que cada traje se ajuste perfectamente a tu cuerpo y
          refleje tu personalidad única. Ya sea para una ocasión especial o para
          tu guardarropa diario, estamos comprometidos a brindarte una
          experiencia de compra excepcional y trajes de la más alta calidad.
        </p>
        
        {/* Boton de llamada a la acción */}
        <button className='btn-primary'>
          Conócenos
        </button>
      </div>

    </section>
  )
}
