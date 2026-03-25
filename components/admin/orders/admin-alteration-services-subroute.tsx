"use client";

import { useEffect, useMemo, useState } from "react";

type AlterationService = {
  id: string;
  nombre: string;
  precioBase: number | string | null;
  activo: boolean;
  updatedAt: string;
};

async function parseApiError(response: Response, fallback: string): Promise<string> {
  const payload = await response.json().catch(() => null);
  if (payload && typeof payload.error === "string") {
    return payload.error;
  }

  return fallback;
}

function boolChip(active: boolean) {
  return active
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
    : "border-stone-500/20 bg-stone-500/10 text-stone-300";
}

export default function AdminAlterationServicesSubroute() {
  const [services, setServices] = useState<AlterationService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [precioBase, setPrecioBase] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPrecioBase, setEditPrecioBase] = useState("");
  const [editActivo, setEditActivo] = useState(true);

  const activeCount = useMemo(
    () => services.filter((service) => service.activo).length,
    [services]
  );

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/alteration-services", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setError("No se pudieron cargar los servicios.");
        return;
      }

      const payload = (await response.json()) as AlterationService[];
      setServices(Array.isArray(payload) ? payload : []);
    } catch {
      setError("Error de red al cargar servicios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshData();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setError(null);

    if (!nombre.trim()) {
      setError("El nombre del servicio es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedPrice = precioBase.trim() === "" ? undefined : Number(precioBase);
      if (parsedPrice !== undefined && !Number.isFinite(parsedPrice)) {
        setError("Precio base invalido.");
        return;
      }

      const response = await fetch("/api/alteration-services", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          precioBase: parsedPrice,
          activo: true,
        }),
      });

      if (!response.ok) {
        setError(await parseApiError(response, "No se pudo crear el servicio."));
        return;
      }

      setNombre("");
      setPrecioBase("");
      setFeedback("Servicio creado correctamente.");
      await refreshData();
    } catch {
      setError("Error de red al crear servicio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (service: AlterationService) => {
    setFeedback(null);
    setError(null);

    try {
      if (service.activo) {
        const response = await fetch(`/api/alteration-services/${service.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          setError(await parseApiError(response, "No se pudo desactivar el servicio."));
          return;
        }
      } else {
        const response = await fetch(`/api/alteration-services/${service.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ activo: true }),
        });

        if (!response.ok) {
          setError(await parseApiError(response, "No se pudo activar el servicio."));
          return;
        }
      }

      setFeedback("Estado del servicio actualizado.");
      await refreshData();
    } catch {
      setError("Error de red al actualizar el estado del servicio.");
    }
  };

  const beginEdit = (service: AlterationService) => {
    setEditingId(service.id);
    setEditNombre(service.nombre);
    setEditPrecioBase(
      service.precioBase === null || service.precioBase === undefined
        ? ""
        : String(service.precioBase)
    );
    setEditActivo(service.activo);
    setFeedback(null);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNombre("");
    setEditPrecioBase("");
    setEditActivo(true);
  };

  const saveEdit = async () => {
    if (!editingId) {
      return;
    }

    setFeedback(null);
    setError(null);

    if (!editNombre.trim()) {
      setError("El nombre del servicio es obligatorio.");
      return;
    }

    const parsedPrice = editPrecioBase.trim() === "" ? null : Number(editPrecioBase);
    if (parsedPrice !== null && !Number.isFinite(parsedPrice)) {
      setError("Precio base invalido.");
      return;
    }

    try {
      const response = await fetch(`/api/alteration-services/${editingId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nombre: editNombre.trim(),
          precioBase: parsedPrice,
          activo: editActivo,
        }),
      });

      if (!response.ok) {
        setError(await parseApiError(response, "No se pudo actualizar el servicio."));
        return;
      }

      setFeedback("Servicio actualizado.");
      cancelEdit();
      await refreshData();
    } catch {
      setError("Error de red al actualizar servicio.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Servicios</p>
          <p className="mt-3 text-3xl font-semibold text-white">{services.length}</p>
          <p className="mt-2 text-sm text-stone-400">Catalogo de arreglos disponible.</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Activos</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-200">{activeCount}</p>
          <p className="mt-2 text-sm text-stone-400">Servicios habilitados para nuevas ordenes.</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Inactivos</p>
          <p className="mt-3 text-3xl font-semibold text-stone-300">
            {services.length - activeCount}
          </p>
          <p className="mt-2 text-sm text-stone-400">Servicios historicos desactivados.</p>
        </article>
      </div>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Nuevo servicio</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Registrar servicio base</h2>

        <form onSubmit={handleCreate} className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Nombre
            <input
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Precio base (S/)
            <input
              type="number"
              step="0.01"
              min="0"
              value={precioBase}
              onChange={(event) => setPrecioBase(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:self-end inline-flex h-[42px] items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
          >
            {isSubmitting ? "Guardando..." : "Crear servicio"}
          </button>
        </form>

        {feedback && (
          <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            {feedback}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}
      </article>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Catalogo</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Servicios de alteracion</h2>
          </div>
          <button
            onClick={() => void refreshData()}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-stone-200 transition hover:bg-white/[0.06]"
          >
            Actualizar
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-stone-400">Cargando servicios...</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500">
                <tr className="border-b border-white/8">
                  <th className="px-3 py-3 font-medium">Servicio</th>
                  <th className="px-3 py-3 font-medium">Precio base</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium">Actualizado</th>
                  <th className="px-3 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-stone-500">
                      No hay servicios registrados.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="border-b border-white/6">
                      <td className="px-3 py-4">
                        <p className="font-medium text-white">{service.nombre}</p>
                      </td>
                      <td className="px-3 py-4 text-stone-200">
                        {service.precioBase === null
                          ? "--"
                          : `S/ ${Number(service.precioBase).toFixed(2)}`}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${boolChip(service.activo)}`}
                        >
                          {service.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-xs text-stone-400">
                        {new Date(service.updatedAt).toLocaleString("es-PE")}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => beginEdit(service)}
                            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-stone-200 transition hover:bg-white/[0.06]"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => void handleToggleActive(service)}
                            className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-1.5 text-xs text-amber-200 transition hover:bg-amber-400/20"
                          >
                            {service.activo ? "Desactivar" : "Reactivar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {editingId && (
        <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Edicion</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Actualizar servicio</h2>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <label className="flex flex-col gap-1 text-sm text-stone-300">
              Nombre
              <input
                type="text"
                value={editNombre}
                onChange={(event) => setEditNombre(event.target.value)}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-stone-300">
              Precio base
              <input
                type="number"
                min="0"
                step="0.01"
                value={editPrecioBase}
                onChange={(event) => setEditPrecioBase(event.target.value)}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
              />
            </label>

            <label className="flex items-center gap-2 self-end text-sm text-stone-300">
              <input
                type="checkbox"
                checked={editActivo}
                onChange={(event) => setEditActivo(event.target.checked)}
                className="size-4 rounded border border-white/20 bg-transparent"
              />
              Activo
            </label>

            <div className="flex items-end gap-2">
              <button
                onClick={() => void saveEdit()}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
              >
                Guardar
              </button>
              <button
                onClick={cancelEdit}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-stone-200 transition hover:bg-white/[0.06]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
