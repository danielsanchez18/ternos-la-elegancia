import { SlidersHorizontal } from "lucide-react";

export default function AdminCatalogPersonalizationsSubroute() {
  return (
    <section className="space-y-6">
      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
          Personalizaciones
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Submodulo en preparacion
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-400">
          La API actual no expone un CRUD dedicado para catalogo de
          personalizaciones de producto. Este frente queda marcado para la fase
          donde se habiliten endpoints de administracion especificos.
        </p>
      </article>

      <div className="rounded-[2rem] border border-dashed border-white/10 p-12 text-center">
        <SlidersHorizontal className="mx-auto size-12 text-stone-700" />
        <h3 className="mt-4 text-lg font-medium text-white">Pendiente de API</h3>
        <p className="mt-2 text-stone-400">
          Cuando se publiquen endpoints de personalizaciones, esta vista se
          conectara de inmediato.
        </p>
      </div>
    </section>
  );
}

