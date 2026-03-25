"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { formatMediumDate, formatStatusLabel } from "@/components/admin/orders/custom-order-shared";
import { rentalOrderStatusChipClasses } from "@/components/admin/orders/order-status-styles";

type CustomerOption = {
  id: string;
  nombres: string;
  apellidos: string;
};

type RentalOrderItem = {
  id: string;
  rentalUnitId: string;
  itemNameSnapshot: string;
  tierAtRental: string;
  unitPrice: string | number;
  returnedAt: string | null;
  returnCondition: string | null;
  notes: string | null;
};

type RentalOrder = {
  id: string;
  customerId: string;
  code: string;
  status: string;
  total: string | number;
  pickupAt: string;
  dueBackAt: string;
  returnedAt: string | null;
  hasDelay: boolean;
  hasDamage: boolean;
  returnNotes: string | null;
  notes: string | null;
  items: RentalOrderItem[];
};

async function parseApiError(response: Response, fallback: string): Promise<string> {
  const payload = await response.json().catch(() => null);
  if (payload && typeof payload.error === "string") {
    return payload.error;
  }

  return fallback;
}

function getRentalActions(status: string): Array<{ action: string; label: string }> {
  if (status === "ENTREGADO") {
    return [
      { action: "MARK_RETURNED", label: "Marcar devuelto" },
      { action: "MARK_LATE", label: "Marcar retraso" },
    ];
  }

  if (status === "ATRASADO") {
    return [{ action: "MARK_RETURNED", label: "Marcar devuelto" }];
  }

  if (status === "DEVUELTO") {
    return [{ action: "CLOSE", label: "Cerrar orden" }];
  }

  if (status === "RESERVADO") {
    return [{ action: "CANCEL", label: "Cancelar" }];
  }

  return [];
}

export default function AdminRentalOrderDetailView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<RentalOrder | null>(null);
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
        fetch(`/api/rental-orders/${orderId}`, {
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
        setError(await parseApiError(orderResponse, "No se pudo cargar la orden de renta."));
        return;
      }

      if (!customersResponse.ok) {
        setError("No se pudieron cargar clientes para el detalle.");
        return;
      }

      const orderPayload = (await orderResponse.json()) as RentalOrder;
      const customersPayload = (await customersResponse.json()) as CustomerOption[];
      setOrder(orderPayload);
      setCustomers(Array.isArray(customersPayload) ? customersPayload : []);
    } catch {
      setError("Error de red al cargar detalle de renta.");
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
      const response = await fetch(`/api/rental-orders/${orderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(action === "MARK_RETURNED" ? { action, hasDamage: false } : { action }),
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
    return <p className="p-6 text-sm text-stone-400">Cargando detalle de renta...</p>;
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {error ?? "No se encontro la orden de renta."}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Renta</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{order.code}</h1>
        </div>
        <Link
          href="/admin/ordenes/rentas"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-stone-200 transition hover:bg-white/[0.06]"
        >
          Volver a rentas
        </Link>
      </div>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${rentalOrderStatusChipClasses(order.status)}`}
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
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Salida</p>
            <p className="mt-2">{formatMediumDate(order.pickupAt)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-stone-300">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Devolucion pactada</p>
            <p className="mt-2">{formatMediumDate(order.dueBackAt)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-stone-300">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Devolucion real</p>
            <p className="mt-2">{formatMediumDate(order.returnedAt)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {getRentalActions(order.status).map((item) => (
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

        {(order.hasDelay || order.hasDamage || order.returnNotes || order.notes) && (
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-stone-300">
            <p>Retraso: {order.hasDelay ? "Si" : "No"}</p>
            <p className="mt-1">Danio: {order.hasDamage ? "Si" : "No"}</p>
            {order.returnNotes && <p className="mt-1">Obs. devolucion: {order.returnNotes}</p>}
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
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Items</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Detalle de prendas</h2>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr className="border-b border-white/8">
                <th className="px-3 py-3 font-medium">Prenda</th>
                <th className="px-3 py-3 font-medium">Unidad</th>
                <th className="px-3 py-3 font-medium">Tier</th>
                <th className="px-3 py-3 font-medium">Precio</th>
                <th className="px-3 py-3 font-medium">Retorno</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-white/6">
                  <td className="px-3 py-4 text-stone-200">{item.itemNameSnapshot}</td>
                  <td className="px-3 py-4 text-stone-300">{item.rentalUnitId}</td>
                  <td className="px-3 py-4 text-stone-300">{item.tierAtRental}</td>
                  <td className="px-3 py-4 text-stone-300">S/ {Number(item.unitPrice).toFixed(2)}</td>
                  <td className="px-3 py-4 text-xs text-stone-400">
                    <p>{formatMediumDate(item.returnedAt)}</p>
                    {item.returnCondition && <p className="mt-1">Condicion: {item.returnCondition}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
