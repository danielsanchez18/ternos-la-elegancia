"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AdminFabricActionData } from "@/components/admin/inventory/types";

type EditFabricFormState = {
  nombre: string;
  color: string;
  supplier: string;
  composition: string;
  pattern: string;
  minMeters: number;
  costPerMeter: number;
  pricePerMeter: number;
};

function buildInitialForm(fabric: AdminFabricActionData): EditFabricFormState {
  return {
    nombre: fabric.nombre,
    color: fabric.color || "",
    supplier: fabric.supplier || "",
    composition: fabric.composition || "",
    pattern: fabric.pattern || "",
    minMeters: Number(fabric.minMeters),
    costPerMeter: Number(fabric.costPerMeter) || 0,
    pricePerMeter: Number(fabric.pricePerMeter) || 0,
  };
}

function buildUpdatePayload(form: EditFabricFormState) {
  return {
    nombre: form.nombre.trim(),
    color: form.color.trim() || null,
    supplier: form.supplier.trim() || null,
    composition: form.composition.trim() || null,
    pattern: form.pattern.trim() || null,
    minMeters: form.minMeters,
    costPerMeter: form.costPerMeter || null,
    pricePerMeter: form.pricePerMeter || null,
  };
}

export function useEditFabricModalController(
  fabric: AdminFabricActionData,
  onClose: () => void
) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState<EditFabricFormState>(() => buildInitialForm(fabric));

  function updateField<K extends keyof EditFabricFormState>(
    key: K,
    value: EditFabricFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/fabrics/${fabric.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(buildUpdatePayload(form)),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          setErrorMsg(payload?.error?.message ?? "Error actualizando tela");
          return;
        }

        router.refresh();
        onClose();
      } catch {
        setErrorMsg("Error de red");
      }
    });
  }

  return {
    isPending,
    errorMsg,
    form,
    updateField,
    handleSubmit,
  };
}
