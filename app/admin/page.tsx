export default function AdminPage() {
  return (
    <main className="min-h-screen bg-stone-950 px-6 py-16 text-stone-100">
      <section className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="space-y-4">
          <span className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
            Integracion MVP
          </span>
          <h1 className="max-w-3xl text-4xl font-oswald uppercase sm:text-6xl">
            Panel admin conectado a la nueva base API
          </h1>
          <p className="max-w-3xl text-base text-stone-300 sm:text-lg">
            Esta pantalla reemplaza el placeholder inicial y deja visible el alcance
            ya integrado: backend, contratos API, auth y modulos disponibles para la
            siguiente iteracion del panel.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Estado tecnico</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Prisma 7, Better Auth, rutas `app/api` y modulos de negocio ya viven en
              esta rama de integracion.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Catalogo publico</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              La home del cliente ya consume `products` y `bundles` desde la API con
              fallback visual para evitar caidas si aun no hay seed.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Siguiente paso</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Construir login, guards por rol y CRUDs modulares para clientes,
              productos, ordenes, citas y promociones.
            </p>
          </article>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Modulos listos en API</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-stone-300">
              <div className="rounded-2xl border border-white/10 px-4 py-3">Clientes</div>
              <div className="rounded-2xl border border-white/10 px-4 py-3">Productos</div>
              <div className="rounded-2xl border border-white/10 px-4 py-3">Bundles</div>
              <div className="rounded-2xl border border-white/10 px-4 py-3">Citas</div>
              <div className="rounded-2xl border border-white/10 px-4 py-3">Ordenes</div>
              <div className="rounded-2xl border border-white/10 px-4 py-3">Promociones</div>
              <div className="rounded-2xl border border-white/10 px-4 py-3">Cupones</div>
              <div className="rounded-2xl border border-white/10 px-4 py-3">Reportes</div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Checklist de arranque</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
              <li>Configurar `DATABASE_URL` y variables de auth.</li>
              <li>Ejecutar migraciones y seed de Prisma.</li>
              <li>Conectar login admin con Better Auth.</li>
              <li>Agregar proteccion de rutas por rol.</li>
              <li>Construir vistas CRUD por modulo.</li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
