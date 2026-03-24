"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { FabricMovement, FabricMovementType } from "@/components/admin/inventory/types";

const defaultType: FabricMovementType = "INGRESO";

export function useFabricMovementsModalController(fabricId: number) {
  const router = useRouter();
  const [movements, setMovements] = useState<FabricMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [type, setType] = useState<FabricMovementType>(defaultType);
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchMovements() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/fabrics/${fabricId}/movements`, {
        credentials: "include",
      });

      if (response.ok) {
        const payload = (await response.json()) as FabricMovement[];
        setMovements(payload);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricId]);

  function handleAddMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");

    if (quantity <= 0) {
      setErrorMsg("La cantidad debe ser mayor a 0.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/fabrics/${fabricId}/movements`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            type,
            quantity,
            note: note.trim() || null,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          setErrorMsg(payload?.error?.message ?? "Error registrando movimiento");
          return;
        }

        setQuantity(0);
        setNote("");
        setType(defaultType);
        await fetchMovements();
        router.refresh();
      } catch {
        setErrorMsg("Error de red");
      }
    });
  }

  return {
    movements,
    isLoading,
    type,
    setType,
    quantity,
    setQuantity,
    note,
    setNote,
    isPending,
    errorMsg,
    handleAddMovement,
  };
}
