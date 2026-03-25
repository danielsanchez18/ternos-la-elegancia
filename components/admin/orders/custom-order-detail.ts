/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CheckCircle2,
  Package,
  Ruler,
  Scissors,
  User,
  type LucideIcon,
} from "lucide-react";

export type PaymentFormState = {
  amount: string;
  method: string;
  concept: string;
  status: string;
  provider: string;
  approvalCode: string;
  voucherUrl: string;
  paidAt: string;
  notes: string;
  operationCode: string;
};

export type ComprobanteFormState = {
  type: string;
  status: string;
  serie: string;
  numero: string;
  subtotal: string;
  impuesto: string;
  total: string;
  issuedAt: string;
  pdfUrl: string;
  xmlUrl: string;
  notes: string;
};

export const initialPaymentFormState: PaymentFormState = {
  amount: "",
  method: "EFECTIVO",
  concept: "ADELANTO",
  status: "APROBADO",
  provider: "",
  approvalCode: "",
  voucherUrl: "",
  paidAt: "",
  notes: "",
  operationCode: "",
};

export const initialComprobanteFormState: ComprobanteFormState = {
  type: "BOLETA",
  status: "EMITIDO",
  serie: "",
  numero: "",
  subtotal: "",
  impuesto: "",
  total: "",
  issuedAt: "",
  pdfUrl: "",
  xmlUrl: "",
  notes: "",
};

export const customOrderDetailStatusColors: Record<string, string> = {
  PENDIENTE_RESERVA: "bg-stone-500/20 text-stone-400 border-stone-500/20",
  RESERVA_CONFIRMADA: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  MEDIDAS_TOMADAS: "bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
  EN_CONFECCION: "bg-amber-500/20 text-amber-400 border-amber-500/20",
  EN_PRUEBA: "bg-orange-500/20 text-orange-400 border-orange-500/20",
  LISTO: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  ENTREGADO: "bg-purple-500/20 text-purple-400 border-purple-500/20",
  CANCELADO: "bg-rose-500/20 text-rose-400 border-rose-500/20",
};

export const customOrderDetailStatusActions: Record<
  string,
  { label: string; icon: LucideIcon; action: string; variant: string }
> = {
  PENDIENTE_RESERVA: {
    label: "Confirmar Reserva",
    icon: CheckCircle2,
    action: "CONFIRM_RESERVATION",
    variant: "bg-emerald-500 text-emerald-950",
  },
  RESERVA_CONFIRMADA: {
    label: "Medidas Tomadas",
    icon: Ruler,
    action: "MARK_MEASUREMENTS_TAKEN",
    variant: "bg-indigo-500 text-white",
  },
  MEDIDAS_TOMADAS: {
    label: "Iniciar Confecci\u00f3n",
    icon: Scissors,
    action: "START_CONFECTION",
    variant: "bg-amber-500 text-amber-950",
  },
  EN_CONFECCION: {
    label: "Iniciar Prueba",
    icon: User,
    action: "START_FITTING",
    variant: "bg-orange-500 text-white",
  },
  EN_PRUEBA: {
    label: "Marcar como Listo",
    icon: CheckCircle2,
    action: "MARK_READY",
    variant: "bg-emerald-500 text-emerald-950",
  },
  LISTO: {
    label: "Entregar Pedido",
    icon: Package,
    action: "MARK_DELIVERED",
    variant: "bg-purple-500 text-white",
  },
};

export function calculateCustomOrderTotalPaid(payments: any[] = []): number {
  return payments.reduce(
    (acc, payment) => acc + (payment.status === "APROBADO" ? payment.amount : 0),
    0
  );
}

export function calculateCustomOrderPendingBalance(
  orderTotal: number,
  totalPaid: number
): number {
  return orderTotal - totalPaid;
}

export function validatePaymentAmount(
  rawAmount: string,
  pendingBalance: number,
  status: string
): string | null {
  const amount = parseFloat(rawAmount);

  if (Number.isNaN(amount) || amount <= 0) {
    return "El monto debe ser un n\u00famero positivo";
  }

  if (status === "APROBADO" && amount > pendingBalance + 0.01) {
    return "El monto no puede exceder el saldo pendiente";
  }

  return null;
}

export function validateComprobanteTotal(
  rawTotal: string,
  orderTotal: number
): string | null {
  const total = parseFloat(rawTotal);

  if (Number.isNaN(total) || total <= 0) {
    return "El total debe ser un n\u00famero positivo";
  }

  if (total > orderTotal + 0.01) {
    return "El total del comprobante no puede exceder el total de la orden";
  }

  return null;
}

function parseOptionalNumber(rawValue: string): number | undefined {
  const normalized = rawValue.trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalDateToIso(rawValue: string): string | undefined {
  const normalized = rawValue.trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

export function getPaymentPayload(paymentForm: PaymentFormState) {
  return {
    amount: parseFloat(paymentForm.amount),
    method: paymentForm.method,
    concept: paymentForm.concept,
    status: paymentForm.status,
    provider: paymentForm.provider.trim() || undefined,
    notes: paymentForm.notes.trim() || undefined,
    operationCode: paymentForm.operationCode.trim() || undefined,
    approvalCode: paymentForm.approvalCode.trim() || undefined,
    voucherUrl: paymentForm.voucherUrl.trim() || undefined,
    paidAt: parseOptionalDateToIso(paymentForm.paidAt),
  };
}

export function getComprobantePayload(comprobanteForm: ComprobanteFormState) {
  return {
    type: comprobanteForm.type,
    status: comprobanteForm.status,
    serie: comprobanteForm.serie.trim() || undefined,
    numero: comprobanteForm.numero.trim() || undefined,
    total: parseFloat(comprobanteForm.total),
    subtotal: parseOptionalNumber(comprobanteForm.subtotal),
    impuesto: parseOptionalNumber(comprobanteForm.impuesto),
    issuedAt: parseOptionalDateToIso(comprobanteForm.issuedAt),
    pdfUrl: comprobanteForm.pdfUrl.trim() || undefined,
    xmlUrl: comprobanteForm.xmlUrl.trim() || undefined,
    notes: comprobanteForm.notes.trim() || undefined,
  };
}

export function getCustomOrderRequiredAdvance(orderTotal: number): number {
  return orderTotal * 0.5;
}

export function shouldShowAdvanceWarning(
  status: string,
  totalPaid: number,
  orderTotal: number
): boolean {
  const preConfectionStatuses = [
    "PENDIENTE_RESERVA",
    "RESERVA_CONFIRMADA",
    "MEDIDAS_TOMADAS",
  ];

  return (
    preConfectionStatuses.includes(status) &&
    totalPaid < getCustomOrderRequiredAdvance(orderTotal)
  );
}

type ApiResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

async function parseErrorResponse(
  response: Response,
  fallback: string
): Promise<ApiResult> {
  if (response.ok) {
    return { ok: true };
  }

  const payload = (await response.json().catch(() => null)) as
    | { error?: string | { message?: string } }
    | null;
  const rawMessage =
    typeof payload?.error === "string"
      ? payload.error
      : payload?.error?.message;
  return { ok: false, message: rawMessage ?? fallback };
}

export async function submitCustomOrderPayment(
  orderId: string,
  paymentForm: PaymentFormState
): Promise<ApiResult> {
  try {
    const response = await fetch(`/api/custom-orders/${orderId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getPaymentPayload(paymentForm)),
    });

    return parseErrorResponse(response, "Error al registrar pago");
  } catch {
    return { ok: false, message: "Error de red" };
  }
}

export async function submitCustomOrderComprobante(
  orderId: string,
  comprobanteForm: ComprobanteFormState
): Promise<ApiResult> {
  try {
    const response = await fetch(`/api/custom-orders/${orderId}/comprobantes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getComprobantePayload(comprobanteForm)),
    });

    return parseErrorResponse(response, "Error al registrar comprobante");
  } catch {
    return { ok: false, message: "Error de red" };
  }
}

export async function patchCustomOrderStatusAction(
  orderId: string,
  action: string,
  note?: string
): Promise<ApiResult> {
  try {
    const response = await fetch(`/api/custom-orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });

    return parseErrorResponse(response, "Error al actualizar estado");
  } catch {
    return { ok: false, message: "Error de red" };
  }
}

export async function fetchCustomerMeasurementProfiles(
  customerId: string
): Promise<{ ok: true; profiles: any[] } | { ok: false; message: string }> {
  try {
    const response = await fetch(`/api/customers/${customerId}/measurement-profiles`);

    if (!response.ok) {
      return { ok: false, message: "Error al cargar perfiles de medidas" };
    }

    const data = (await response.json()) as any[];
    return { ok: true, profiles: data };
  } catch {
    return { ok: false, message: "Error de red" };
  }
}

export async function patchCustomOrderMeasurementLink(input: {
  orderId: string;
  partId: string;
  profileId: string;
  profileGarmentId: string;
}): Promise<ApiResult> {
  try {
    const response = await fetch(`/api/custom-orders/${input.orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "LINK_MEASUREMENT",
        partId: input.partId,
        profileId: input.profileId,
        profileGarmentId: input.profileGarmentId,
      }),
    });

    return parseErrorResponse(response, "Error al vincular medidas");
  } catch {
    return { ok: false, message: "Error de red" };
  }
}
