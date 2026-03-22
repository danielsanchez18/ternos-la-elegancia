export const OurStore = () => {
    return (
        <div className="flex flex-col gap-y-10">
            
            <div className='flex flex-col w-full gap-y-2'>
                <h3 className='text-4xl font-medium font-oswald uppercase'>dentro de Nuestra Tienda</h3>
                <p className='text-neutral-700 text-balance'>Un vistazo a la experiencia que te espera en La Elegancia.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-x-5">
                <div className="h-60 bg-black/10"></div>
                <div className="h-60 bg-black/10"></div>
                <div className="h-60 bg-black/10"></div>
            </div>

        </div>
    )
}