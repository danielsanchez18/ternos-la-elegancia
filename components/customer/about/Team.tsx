const teamMembers = [
    {
        name: "María López",
        role: "Fundadora y Diseñadora Principal",
        description: "Con más de 15 años en la industria de la moda, María es la mente creativa detrás de Elegancia. Su pasión por el diseño y su compromiso con la calidad han sido fundamentales para el éxito de la marca.",
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFyaWF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
        name: "Carlos Martínez",
        role: "Gerente de Ventas",
        description: "Carlos lidera nuestro equipo de ventas con una visión estratégica y un enfoque centrado en el cliente. Su experiencia en el sector retail ha sido clave para expandir nuestra presencia en el mercado.",
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FybG9zfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
        name: "Sofía García",
        role: "Asesora de Estilo",
        description: "Sofía es nuestra experta en moda y estilo. Con un ojo agudo para las tendencias y una pasión por ayudar a los clientes a encontrar su look perfecto, Sofía es una parte esencial de nuestro equipo.",
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c29maWF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
        name: "Javier Rodríguez",
        role: "Encargado de Logística",
        description: "Javier se encarga de que cada pedido llegue a tiempo y en perfectas condiciones. Su atención al detalle y su compromiso con la satisfacción del cliente son invaluables para nuestro equipo.",
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amF2aWVyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
        name: "Lucía Fernández",
        role: "Atención al Cliente",
        description: "Lucía es la voz amable y servicial que atiende a nuestros clientes. Su dedicación para resolver dudas y brindar una experiencia de compra excepcional es fundamental para nuestro éxito.",
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHVjaWF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    }
]

export const Team = () => {
    return (
        <div className="space-y-15 mx-auto max-w-5xl">
            {/* Título y Descripción */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h2 className="text-5xl font-oswald font-medium uppercase">
                La familia Elegancia
                </h2>
                <p className="text-neutral-700 text-balance text-lg">
                Un equipo joven y familiar, apasionado por el buen vestir y listo para asesorarte en cada ocasión.
                </p>
            </div>

            {/* Miembros del Equipo */}
            <div className="flex flex-wrap items-center justify-center gap-10">
                {teamMembers.map((member, index) => (
                    <div 
                        key={index} 
                        className="relative flex flex-col items-center hover:scale-105 transition-transform duration-300">
                        <div className="relative w-68 h-68 flex items-center justify-center">
                            <svg
                                className="absolute w-full h-full animate-spin-slow"
                                viewBox="0 0 200 200"
                            >
                                <path
                                    id={`circlePath-${member.name.replace(/\s+/g, '-')}`}
                                    d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"
                                    fill="transparent"></path>
                                <text
                                    className="fill-black font-semibold text-xs tracking-[0.2em] uppercase"
                                >
                                    <textPath
                                        xlinkHref={`#circlePath-${member.name.replace(/\s+/g, '-')}`}
                                        startOffset=""
                                        textAnchor="start"
                                    >
                                        {member.role} 
                                    </textPath>
                                </text>
                            </svg>

                            <div
                                className="w-48 h-48 rounded-full overflow-hidden bg-white/5"
                            >
                                <img
                                    src={member.imageUrl}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <h4 className="text-black px-5 py-2 -mt-5 font-medium bg-black/10 w-fit mx-auto">{member.name}</h4>
                    </div>
                ))}
            </div>
        </div>
    )
}