"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MoreVertical,
  ArrowRightCircle,
  Ban,
  AlertCircle,
  Eye,
  Edit,
} from "lucide-react";
import {
  type AdminCustomOrderActionData,
  getCustomOrderTransition,
  patchCustomOrderAction,
  shouldShowCancelAction,
} from "@/components/admin/orders/custom-order-actions";

export default function AdminCustomOrderActions({
  order,
}: {
  order: AdminCustomOrderActionData;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: string;
    label: string;
    isCancel: boolean;
  }>({ isOpen: false, action: "", label: "", isCancel: false });

  const possibleTransition = getCustomOrderTransition(order.status);

  function promptTransition(action: string, label: string) {
    setIsOpen(false);
    setConfirmDialog({ isOpen: true, action, label, isCancel: false });
  }

  function promptCancel() {
    setIsOpen(false);
    setConfirmDialog({
      isOpen: true,
      action: "CANCEL",
      label: "Cancelar orden",
      isCancel: true,
    });
  }

  function handleConfirm() {
    setErrorMsg("");
    const actionToPerform = confirmDialog.action;
    setConfirmDialog({ isOpen: false, action: "", label: "", isCancel: false });

    startTransition(async () => {
      const result = await patchCustomOrderAction(order.id, actionToPerform);

      if (!result.ok) {
        setErrorMsg(result.errorMessage);
        return;
      }

      router.refresh();
    });
  }

  function closeDialog() {
    setConfirmDialog({ isOpen: false, action: "", label: "", isCancel: false });
  }

  return (
    <>
      {errorMsg && (
        <div className="absolute right-12 z-20 mt-2 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 shadow-xl max-w-[250px] text-left">
          <AlertCircle className="size-3 flex-shrink-0" />
          {errorMsg}
          <button onClick={() => setErrorMsg("")} className="ml-auto underline">
            x
          </button>
        </div>
      )}

      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-stone-400 hover:bg-white/5 hover:text-white transition"
          disabled={isPending}
        >
          {isPending ? (
            <div className="size-4 animate-spin rounded-full border-2 border-stone-500 border-t-white" />
          ) : (
            <MoreVertical className="size-4" />
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#121212] shadow-xl">
            <div className="p-1">
              <Link
                href={`/admin/ordenes/personalizadas/${order.id}`}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-300 transition hover:bg-white/5"
              >
                <Eye className="size-4" />
                Ver detalles
              </Link>

              <Link
                href={`/admin/ordenes/personalizadas/${order.id}/editar`}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-300 transition hover:bg-white/5"
              >
                <Edit className="size-4" />
                Editar orden
              </Link>

              {possibleTransition && (
                <>
                  <hr className="my-1 border-white/10" />
                  <button
                    onClick={() =>
                      promptTransition(
                        possibleTransition.nextAction,
                        possibleTransition.label
                      )
                    }
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-400 transition hover:bg-white/5 text-left"
                  >
                    <ArrowRightCircle className="size-4 flex-shrink-0" />
                    <span>
                      {possibleTransition.label}
                      {possibleTransition.requiresAdvance && (
                        <span className="block text-[10px] text-emerald-600 mt-0.5">
                          Requiere 50% pagado
                        </span>
                      )}
                    </span>
                  </button>
                </>
              )}

              {shouldShowCancelAction(order.status) && (
                <>
                  <hr className="my-1 border-white/10" />
                  <button
                    onClick={promptCancel}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-400 transition hover:bg-white/5"
                  >
                    <Ban className="size-4" />
                    Cancelar orden
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0e0e0e] p-6 shadow-2xl text-left">
            <h3 className="text-xl font-semibold text-white mb-2">
              {confirmDialog.isCancel
                ? "Confirmar Cancelación"
                : "Avanzar Estado"}
            </h3>
            <p className="text-sm text-stone-400 mb-6">
              {confirmDialog.isCancel
                ? "¿Estás seguro de cancelar esta orden? Esta acción no se puede deshacer."
                : `¿Estás seguro de avanzar la orden a "${confirmDialog.label}"?`}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeDialog}
                className="rounded-xl px-4 py-2 text-sm font-medium text-stone-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  confirmDialog.isCancel
                    ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    : "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                }`}
              >
                {confirmDialog.isCancel ? "Sí, cancelar orden" : "Confirmar avance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
