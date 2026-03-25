export type AdminCustomOrderActionData = {
  id: string;
  status: string;
};

export type CustomOrderActionTransition = {
  nextAction: string;
  label: string;
  requiresAdvance?: boolean;
};

export const customOrderActionMap: Record<string, CustomOrderActionTransition> =
  {
    PENDIENTE_RESERVA: {
      nextAction: "CONFIRM_RESERVATION",
      label: "Confirmar Reserva",
    },
    RESERVA_CONFIRMADA: {
      nextAction: "MARK_MEASUREMENTS_TAKEN",
      label: "Marcar Medidas Tomadas",
    },
    MEDIDAS_TOMADAS: {
      nextAction: "START_CONFECTION",
      label: "Iniciar Confeccion",
      requiresAdvance: true,
    },
    EN_CONFECCION: {
      nextAction: "START_FITTING",
      label: "Pasar a Prueba",
    },
    EN_PRUEBA: {
      nextAction: "MARK_READY",
      label: "Marcar Listo",
    },
    LISTO: {
      nextAction: "MARK_DELIVERED",
      label: "Marcar Entregado",
    },
  };

export function shouldShowCancelAction(status: string): boolean {
  return status !== "CANCELADO" && status !== "ENTREGADO";
}

export function getCustomOrderTransition(
  status: string
): CustomOrderActionTransition | undefined {
  return customOrderActionMap[status];
}

export async function patchCustomOrderAction(
  orderId: string,
  action: string
): Promise<{ ok: true } | { ok: false; errorMessage: string }> {
  try {
    const response = await fetch(`/api/custom-orders/${orderId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        payload?.error?.message ??
        "Error al avanzar el estado. Verifica si requiere 50% de pago.";

      return { ok: false, errorMessage: message };
    }

    return { ok: true };
  } catch {
    return { ok: false, errorMessage: "Error de red" };
  }
}
