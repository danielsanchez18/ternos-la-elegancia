"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowDownRight, ArrowUpRight, ArrowRightLeft } from "lucide-react";
import type { AdminFabricActionData } from "./AdminFabricActions";

type Movement = {
  id: number;
  type: "INGRESO" | "SALIDA" | "AJUSTE" | "MERMA" | "CONFECCION";
  quantity: any;
  note: string | null;
  happenedAt: string;
};

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function AdminFabricMovementsModal({
  fabric,
  onClose,
}: {
  fabric: AdminFabricActionData;
  onClose: () => void;
}) {
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [type, setType] = useState<Movement["type"]>("INGRESO");
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const fetchMovements = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/fabrics/${fabric.id}/movements`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setMovements(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabric.id]);

  function handleAddMovement(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (quantity <= 0) {
      setErrorMsg("La cantidad debe ser mayor a 0.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/fabrics/${fabric.id}/movements`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            type,
            quantity,
            note: note.trim() || null,
          }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          setErrorMsg(payload?.error?.message ?? "Error registrando movimiento");
          return;
        }
        
        // Success
        setQuantity(0);
        setNote("");
        setType("INGRESO");
        await fetchMovements();
        router.refresh();
      } catch (err) {
        setErrorMsg("Error de red");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e0e0e] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-white/5 p-6 md:p-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Inventario
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              Historial de movimientos
            </h2>
            <p className="mt-1 text-sm text-stone-400">
              {fabric.code} - {fabric.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto grid gap-6 md:grid-cols-2 flex-grow min-h-0">
          {/* Col 1: History */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-300">Movimientos recientes</h3>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center text-sm text-stone-500 py-6">Cargando...</div>
              ) : movements.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-stone-500">
                  No hay movimientos registrados.
                </div>
              ) : (
                movements.map((mov) => {
                  const isPositive = mov.type === "INGRESO" || mov.type === "AJUSTE";
                  const Icon =
                    mov.type === "INGRESO" ? ArrowDownRight : mov.type === "SALIDA" ? ArrowUpRight : ArrowRightLeft;

                  return (
                    <article
                      key={mov.id}
                      className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-2 ${
                            isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{mov.type}</p>
                          <p className="text-xs text-stone-500">{mov.note || "Sin nota"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            isPositive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isPositive ? "+" : "-"}
                          {Number(mov.quantity)}m
                        </p>
                        <p className="text-[10px] text-stone-500">
                          {dateFormatter.format(new Date(mov.happenedAt))}
                        </p>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          {/* Col 2: New Movement Form */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 h-fit">
            <h3 className="text-sm font-medium text-stone-300 mb-4">Registrar Movimiento</h3>
            <form onSubmit={handleAddMovement} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-400">Tipo</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Movement["type"])}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="INGRESO">INGRESO</option>
                  <option value="SALIDA">SALIDA</option>
                  <option value="MERMA">MERMA</option>
                  <option value="AJUSTE">AJUSTE</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-400">Metros</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantity || ""}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none"
                  required
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-400">Nota (Opcional)</span>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ej: Nuevo rollo recibido"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none"
                />
              </label>

              {errorMsg && (
                <div className="rounded-lg bg-rose-500/10 p-2 text-xs text-rose-400 border border-rose-500/20">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-stone-200 disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Registrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
