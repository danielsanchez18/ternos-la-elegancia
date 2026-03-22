import Image from "next/image";
import Image1 from "@/assets/images/ternos-hero.jpg";

export const Hero = () => {
    return (
        <div id="hero" className="">
            <div className="h-200 transition-all bg-black/80 overflow-hidden w-full relative">

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
                <div className="max-w-350 mx-auto h-full flex flex-col justify-center max-xl:px-4 space-y-8 z-20 absolute inset-0">
                    
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