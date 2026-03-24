"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type CreateFabricFormState = {
  code: string;
  nombre: string;
  color: string;
  supplier: string;
  composition: string;
  pattern: string;
  metersInStock: number;
  minMeters: number;
  costPerMeter: number;
  pricePerMeter: number;
};

const initialFormState: CreateFabricFormState = {
  code: "",
  nombre: "",
  color: "",
  supplier: "",
  composition: "",
  pattern: "",
  metersInStock: 0,
  minMeters: 5,
  costPerMeter: 0,
  pricePerMeter: 0,
};

function buildCreateFabricPayload(form: CreateFabricFormState) {
  return {
    code: form.code.trim(),
    nombre: form.nombre.trim(),
    color: form.color.trim() || null,
    supplier: form.supplier.trim() || null,
    composition: form.composition.trim() || null,
    pattern: form.pattern.trim() || null,
    metersInStock: Number(form.metersInStock),
    minMeters: Number(form.minMeters),
    costPerMeter: Number(form.costPerMeter) || null,
    pricePerMeter: Number(form.pricePerMeter) || null,
    active: true,
  };
}

export function useCreateFabricFormController(onClose?: () => void) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CreateFabricFormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function updateField<K extends keyof CreateFabricFormState>(
    key: K,
    value: CreateFabricFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/fabrics", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(buildCreateFabricPayload(form)),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error: { message: string } }
            | null;
          setErrorMessage(payload?.error?.message ?? "Error inesperado al crear tela.");
          return;
        }

        setForm(initialFormState);
        setSuccessMessage("Tela registrada correctamente.");
        router.refresh();

        if (onClose) {
          setTimeout(onClose, 1500);
        }
      } catch {
        setErrorMessage("Error de red.");
      }
    });
  }

  return {
    isPending,
    form,
    errorMessage,
    successMessage,
    updateField,
    handleSubmit,
  };
}
