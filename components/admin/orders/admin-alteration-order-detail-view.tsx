"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { alterationOrderStatusChipClasses } from "@/components/admin/orders/order-status-styles";
import { formatMediumDate, formatStatusLabel } from "@/components/admin/orders/custom-order-shared";

type CustomerOption = {
  id: string;
  nombres: string;
  apellidos: string;
};

type AlterationOrder = {
  id: string;
  customerId: string;
  code: string;
  status: string;
  serviceId: string | null;
  garmentDescription: string;
  workDescription: string;
  initialCondition: string | null;
  receivedAt: string;
  promisedAt: string | null;
  deliveredAt: string | null;
  subtotal: string | number;
  discountTotal: string | number;
  total: string | number;
  notes: string | null;
  service: {
    id: string;
    nombre: string;
    precioBase: string | number | null;
    activo: boolean;
  } | null;
};

async function parseApiError(response: Response, fallback: string): Promise<string> {
  const payload = await response.json().catch(() => null);
  if (payload && typeof payload.error === "string") {
    return payload.error;
  }

  return fallback;
}

function getAlterationActions(status: string): Array<{ action: string; label: string }> {
  if (status === "RECIBIDO") {
    return [
      { action: "START_EVALUATION", label: "Iniciar evaluacion" },
      { action: "CANCEL", label: "Cancelar" },
    ];
  }

  if (status === "EN_EVALUACION") {
    return [
      { action: "START_WORK", label: "Iniciar trabajo" },
      { action: "CANCEL", label: "Cancelar" },
    ];
  }

  if (status === "EN_PROCESO") {
    return [
      { action: "MARK_READY", label: "Marcar listo" },
      { action: "CANCEL", label: "Cancelar" },
    ];
  }

  if (status === "LISTO") {
    return [
      { action: "MARK_DELIVERED", label: "Marcar entregado" },
      { action: "CANCEL", label: "Cancelar" },
    ];
  }

  return [];
}

export default function AdminAlterationOrderDetailView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<AlterationOrder | null>(null);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const customerById = useMemo(
    () =>
      new Map(
        customers.map((customer) => [
          customer.id,
          `${customer.nombres} ${customer.apellidos}`.trim(),
        ])
      ),
    [customers]
  );

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [orderResponse, customersResponse] = await Promise.all([
        fetch(`/api/alteration-orders/${orderId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/customers", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (!orderResponse.ok) {
        setError(
          await parseApiError(orderResponse, "No se pudo cargar la orden de alteracion.")
        );
        return;
      }

      if (!customersResponse.ok) {
        setError("No se pudieron cargar clientes para el detalle.");
        return;
      }

      const orderPayload = (await orderResponse.json()) as AlterationOrder;
      const customersPayload = (await customersResponse.json()) as CustomerOption[];
      setOrder(orderPayload);
      setCustomers(Array.isArray(customersPayload) ? customersPayload : []);
    } catch {
      setError("Error de red al cargar detalle de alteracion.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const runAction = async (action: string) => {
    setIsPending(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(`/api/alteration-orders/${orderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        setError(await parseApiError(response, "No se pudo actualizar la orden."));
        return;
      }

      setFeedback("Orden actualizada.");
      await refreshData();
    } catch {
      setError("Error de red al actualizar la orden.");
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return <p className="p-6 text-sm text-stone-400">Cargando detalle de alteracion...</p>;
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {error ?? "No se encontro la orden de alteracion."}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Alteracion</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{order.code}</h1>
        </div>
        <Link
          href="/admin/ordenes/alteraciones"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-stone-200 transition hover:bg-white/[0.06]"
        >
          Volver a alteraciones
        </Link>
      </div>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${alterationOrderStatusChipClasses(order.status)}`}
          >
            {formatStatusLabel(order.status)}
          </span>
          <span className="text-sm text-stone-300">
            Cliente: {customerById.get(order.customerId) ?? order.customerId}
          </span>
          <span className="text-sm text-stone-300">Total: S/ {Number(order.total).toFixed(2)}</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-stone-300">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Recibido</p>
            <p className="mt-2">{formatMediumDate(order.receivedAt)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-stone-300">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Prometido</p>
            <p className="mt-2">{formatMediumDate(order.promisedAt)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-stone-300">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Entregado</p>
            <p className="mt-2">{formatMediumDate(order.deliveredAt)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {getAlterationActions(order.status).map((item) => (
            <button
              key={item.action}
              onClick={() => void runAction(item.action)}
              disabled={isPending}
              className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {item.label}
            </button>
          ))}
        </div>

        {(order.notes || order.initialCondition) && (
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-stone-300">
            {order.initialCondition && <p>Condicion inicial: {order.initialCondition}</p>}
            {order.notes && <p className="mt-1">Notas: {order.notes}</p>}
          </div>
        )}

        {feedback && (
          <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            {feedback}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}
      </article>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Trabajo</p>
        <h2 className="mt-2 text-xl font-semibold text-white">{order.garmentDescription}</h2>
        <p className="mt-3 text-sm text-stone-300">{order.workDescription}</p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-stone-300">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Subtotal</p>
            <p className="mt-2">S/ {Number(order.subtotal).toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-stone-300">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Descuento</p>
            <p className="mt-2">S/ {Number(order.discountTotal).toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-stone-300">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Servicio base</p>
            <p className="mt-2">{order.service?.nombre ?? "Sin servicio base"}</p>
          </div>
        </div>
      </article>
    </section>
  );
}
