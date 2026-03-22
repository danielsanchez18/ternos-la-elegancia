export const Features = () => {
  return (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="border border-gray-300 px-10 py-6 flex flex-col text-center hover:border-primary transition-colors duration-300">  
                <h3 className="text-xl font-semibold mb-4">Calidad Superior</h3>
                <p className="text-gray-700">Nuestros trajes están confeccionados con los mejores materiales para garantizar durabilidad y elegancia.</p>
            </div>
            <div className="border border-gray-300 px-10 py-6 flex flex-col text-center hover:border-primary transition-colors duration-300">  
                <h3 className="text-xl font-semibold mb-4">Diseños Exclusivos</h3>
                <p className="text-gray-700">Ofrecemos una amplia variedad de estilos y cortes para que encuentres el traje perfecto para cualquier ocasión.</p>
            </div>
            <div className="border border-gray-300 px-10 py-6 flex flex-col text-center hover:border-primary transition-colors duration-300">  
                <h3 className="text-xl font-semibold mb-4">Atención Personalizada</h3>
                <p className="text-gray-700">Nuestro equipo de expertos está siempre dispuesto a ayudarte a elegir el traje ideal y brindarte una experiencia de compra excepcional.</p>
            </div>
        </div>
    </div>
  );
};
