"use client";

import { useState } from "react";
import {
  MoreVertical,
  History,
  Edit2,
  PackagePlus,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AdminFabricMovementsModal from "./AdminFabricMovementsModal";
import AdminEditFabricModal from "./AdminEditFabricModal";

export type AdminFabricActionData = {
  id: number;
  code: string;
  nombre: string;
  color: string | null;
  supplier: string | null;
  composition: string | null;
  pattern: string | null;
  metersInStock: any;
  minMeters: any;
  costPerMeter: any;
  pricePerMeter: any;
  active: boolean;
};

export default function AdminFabricActions({
  fabric,
}: {
  fabric: AdminFabricActionData;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleToggleActive() {
    setIsPending(true);
    try {
      if (fabric.active) {
        // Desactivar
        await fetch(`/api/fabrics/${fabric.id}`, {
          method: "DELETE",
          credentials: "include",
        });
      } else {
        // Activar (PATCH)
        await fetch(`/api/fabrics/${fabric.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ active: true }),
        });
      }
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-stone-400 hover:bg-white/5 hover:text-white transition"
        >
          <MoreVertical className="size-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#121212] shadow-xl">
            <div className="p-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowEditModal(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-300 transition hover:bg-white/5"
              >
                <Edit2 className="size-4" />
                Editar tela
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowMovementsModal(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-300 transition hover:bg-white/5"
              >
                <History className="size-4" />
                Movimientos
              </button>

              <hr className="my-1 border-white/10" />

              <button
                onClick={handleToggleActive}
                disabled={isPending}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 ${fabric.active ? "text-rose-400" : "text-emerald-400"
                  }`}
              >
                {fabric.active ? (
                  <>
                    <Ban className="size-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Reactivar
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {showMovementsModal && (
        <AdminFabricMovementsModal
          fabric={fabric}
          onClose={() => setShowMovementsModal(false)}
        />
      )}

      {showEditModal && (
        <AdminEditFabricModal
          fabric={fabric}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
