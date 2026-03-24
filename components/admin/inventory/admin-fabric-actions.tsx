"use client";

import {
  Ban,
  CheckCircle2,
  Edit2,
  History,
  MoreVertical,
} from "lucide-react";

import AdminEditFabricModal from "@/components/admin/AdminEditFabricModal";
import AdminFabricMovementsModal from "@/components/admin/AdminFabricMovementsModal";
import { useFabricActionsController } from "@/components/admin/inventory/fabric-actions.controller";
import type { AdminFabricActionData } from "@/components/admin/inventory/types";

export type { AdminFabricActionData };

export default function AdminFabricActions({
  fabric,
}: {
  fabric: AdminFabricActionData;
}) {
  const {
    isOpen,
    setIsOpen,
    showMovementsModal,
    setShowMovementsModal,
    showEditModal,
    setShowEditModal,
    isPending,
    handleToggleActive,
  } = useFabricActionsController(fabric);

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
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 ${
                  fabric.active ? "text-rose-400" : "text-emerald-400"
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
