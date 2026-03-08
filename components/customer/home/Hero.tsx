export const Hero = () => {
    return (
        <div id="hero" className="lg:px-4">
            <div className="h-200 lg:rounded-t-3xl transition-all bg-black/80 w-full relative">

                {/* Contenido */}
                <div className="max-w-350 mx-auto h-full flex flex-col justify-center max-xl:px-4 space-y-8">
                    
                    <div className="text-white max-w-3xl space-y-4">
                        <h1 className="uppercase text-2xl tracking-widest font-oswald">Ternos La Elegancia</h1>
                        <h2 className="text-8xl font-medium text-balance font-oswald uppercase">El arte de vestir bien</h2>
                        <p className="text-2xl font-light">Donde la elegancia tradicional se encuentra con el corte moderno. Trajes premium diseñados exclusivamente para ti.</p>
                    </div>

                    <div className="flex items-center gap-x-4">
                        <button className="bg-primary text-white text-lg border border-primary px-5 py-2.5 hover:bg-primary-hover">Explorar Colección</button>
                        <button className="bg-transparent border border-white text-lg text-white px-5 py-2.5 hover:bg-white/10">Agendar Cita</button>
                    </div>
                </div>
            </div>
        </div>
    )
}