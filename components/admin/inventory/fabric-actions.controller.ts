"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { AdminFabricActionData } from "@/components/admin/inventory/types";

export function useFabricActionsController(fabric: AdminFabricActionData) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleToggleActive() {
    setIsPending(true);

    try {
      if (fabric.active) {
        await fetch(`/api/fabrics/${fabric.id}`, {
          method: "DELETE",
          credentials: "include",
        });
      } else {
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

  return {
    isOpen,
    setIsOpen,
    showMovementsModal,
    setShowMovementsModal,
    showEditModal,
    setShowEditModal,
    isPending,
    handleToggleActive,
  };
}
