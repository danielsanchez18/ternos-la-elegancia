import Image from "next/image"

export const OurStore = () => {
    return (
        <div className="flex flex-col gap-y-10">
            
            <div className='flex flex-col w-full gap-y-2'>
                <h3 className='text-4xl font-medium font-oswald uppercase'>dentro de Nuestra Tienda</h3>
                <p className='text-neutral-700 text-balance'>Un vistazo a la experiencia que te espera en La Elegancia.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-x-5">
                <div className="relative h-60 bg-black/10 group cursor-pointer overflow-hidden">
                    <Image 
                        src="/images/our-store-1.jpg"
                        alt="Nuestra Tienda"
                        fill
                        className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative h-60 bg-black/10 group cursor-pointer overflow-hidden">
                    <Image 
                        src="/images/our-store-2.jpg"
                        alt="Nuestra Tienda"
                        fill
                        className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative h-60 bg-black/10 group cursor-pointer overflow-hidden">
                    <Image 
                        src="/images/our-store-3.jpg"
                        alt="Nuestra Tienda"
                        fill
                        className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </div>

        </div>
    )
}