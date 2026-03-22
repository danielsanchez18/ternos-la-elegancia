export const Location = () => {
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-10">
      {/* Viñetas */}
      <div className="flex flex-col gap-y-3">
        <div className="px-10 py-4 flex gap-x-5 bg-primary/5 border border-primary/50 w-full">
          <div className="p-2 rounded-full h-fit bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m21 3l-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold uppercase">
              Nuestra Ubicación
            </h3>
            <p className="">Leoncio Prado #942 Chiclayo, Perú</p>
            <p>Chiclayo, Perú</p>
          </div>
        </div>

        <div className="px-10 py-4 flex gap-x-5 bg-primary/5 border border-primary/50 w-full">
          <div className="p-2 rounded-full h-fit bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0" />
                <path d="M12 7v5l3 3" />
              </g>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold uppercase">
              Horarios de Atención
            </h3>
            <p>Lun - Sáb: 9:00 AM - 8:00 PM</p>
            <p>Dom: 9:00 AM - 12:30 PM</p>
          </div>
        </div>

        <div className="px-10 py-4 flex gap-x-5 bg-primary/5 border border-primary/50 w-full">
          <div className="p-2 rounded-full h-fit bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="m16.1 13.359l-.528-.532zm.456-.453l.529.532zm2.417-.317l-.358.66zm1.91 1.039l-.358.659zm.539 3.255l.529.532zm-1.42 1.412l-.53-.531zm-1.326.67l.07.747zm-9.86-4.238l.528-.532zM4.002 5.746l-.749.042zm6.474 1.451l.53.532zm.157-2.654l.6-.449zM9.374 2.86l-.601.45zM6.26 2.575l.53.532zm-1.57 1.56l-.528-.531zm7.372 7.362l.529-.532zm4.567 2.394l.455-.453l-1.058-1.064l-.455.453zm1.985-.643l1.91 1.039l.716-1.318l-1.91-1.038zm2.278 3.103l-1.42 1.413l1.057 1.063l1.42-1.412zm-2.286 1.867c-1.45.136-5.201.015-9.263-4.023l-1.057 1.063c4.432 4.407 8.65 4.623 10.459 4.454zm-9.263-4.023c-3.871-3.85-4.512-7.087-4.592-8.492l-1.498.085c.1 1.768.895 5.356 5.033 9.47zm1.376-6.18l.286-.286L9.95 6.666l-.287.285zm.515-3.921L9.974 2.41l-1.201.899l1.26 1.684zM5.733 2.043l-1.57 1.56l1.058 1.064l1.57-1.56zm4.458 5.44c-.53-.532-.53-.532-.53-.53h-.002l-.003.004a1 1 0 0 0-.127.157c-.054.08-.113.185-.163.318a2.1 2.1 0 0 0-.088 1.071c.134.865.73 2.008 2.256 3.526l1.058-1.064c-1.429-1.42-1.769-2.284-1.832-2.692c-.03-.194.001-.29.01-.312q.009-.02 0-.006a.3.3 0 0 1-.03.039l-.01.01l-.01.009zm1.343 4.546c1.527 1.518 2.676 2.11 3.542 2.242c.443.068.8.014 1.071-.087a1.5 1.5 0 0 0 .42-.236l.05-.045l.007-.006l.003-.003l.001-.002s.002-.001-.527-.533c-.53-.532-.528-.533-.528-.533l.002-.002l.002-.002l.006-.005l.01-.01l.038-.03q.014-.009-.007.002c-.025.009-.123.04-.32.01c-.414-.064-1.284-.404-2.712-1.824zm-1.56-9.62C8.954 1.049 6.95.834 5.733 2.044L6.79 3.107c.532-.529 1.476-.475 1.983.202zM4.752 5.704c-.02-.346.139-.708.469-1.036L4.163 3.604c-.537.534-.96 1.29-.909 2.184zm14.72 12.06c-.274.274-.57.428-.865.455l.139 1.494c.735-.069 1.336-.44 1.784-.885zM11.006 7.73c.985-.979 1.058-2.527.229-3.635l-1.201.899c.403.539.343 1.246-.085 1.673zm9.52 6.558c.817.444.944 1.49.367 2.064l1.058 1.064c1.34-1.333.927-3.557-.71-4.446zm-3.441-.849c.384-.382 1.002-.476 1.53-.19l.716-1.317c-1.084-.59-2.428-.427-3.304.443z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold uppercase">
              Canales de Contacto
            </h3>
            <p>WhatsApp:
                <span>
                    <a href="whatsapp://send?phone=51995744047" target="blank" className="ml-2 hover:underline hover:text-primary">
                        +51 995 744 047
                    </a>
                </span>
            </p>
            <p>Telefono: 
                <span>
                    <a href="tel:+51981326844" target="blank" className="ml-2 hover:underline hover:text-primary">
                        +51 981 326 844
                    </a>
                </span>
            </p>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-black/10 h-120">
        <iframe
            title="Ubicación de la tienda"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.441086419714!2d-79.9410967852038!3d-6.771644995008698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9109a5c7e5b8e9b%3A0x9c8a7c8e5b8e9b8!2sLeoncio%20Prado%20942%2C%20Chiclayo%2001401%2C%20Per%C3%BA!5e0!3m2!1ses-419!2sus!4v1700000000000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
        />
      </div>
    </div>
  );
};
