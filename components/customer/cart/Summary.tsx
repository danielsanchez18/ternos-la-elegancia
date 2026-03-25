export const Summary = () => {
  return (
    <div className="border border-gray-300 h-fit px-10 py-7">
      <h3 className="text-xl font-medium uppercase">Resumen del pedido</h3>

      <div className="flex flex-col gap-y-2 mt-10">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Subtotal</span>
          <span className="font-medium">$ 1.000.000</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Envío</span>
          <span className="font-medium">$ 20.000</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Descuento</span>
          <span className="font-medium">-$ 50.000</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-10 pt-5 border-t border-gray-300">
        <span className="text-lg font-medium uppercase">Total</span>
        <span className="text-lg font-bold text-primary">$ 970.000</span>
      </div>


      <div className="mt-10">
        <button type="button" className="w-full btn-primary transition">
          Continuar con la compra
        </button>
        <p className="text-sm text-gray-700 mt-2">
          Al continuar con la compra, aceptas nuestros <a href="#" className="text-primary underline">Términos y condiciones</a>.
        </p>
      </div>



    </div>
  )
}
