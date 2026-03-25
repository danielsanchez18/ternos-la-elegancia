"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { alterationOrderStatusChipClasses } from "@/components/admin/orders/order-status-styles";
import { formatMediumDate, formatStatusLabel } from "@/components/admin/orders/custom-order-shared";

type CustomerOption = {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
};

type AlterationServiceOption = {
  id: string;
  nombre: string;
  activo: boolean;
};

type AlterationOrder = {
  id: string;
  customerId: string;
  code: string;
  status: string;
  serviceId: string | null;
  garmentDescription: string;
  workDescription: string;
  receivedAt: string;
  promisedAt: string | null;
  deliveredAt: string | null;
  total: string | number;
  service: {
    id: string;
    nombre: string;
  } | null;
};

type AlterationOrderListResponse = {
  items: AlterationOrder[];
};

function toDateTimeLocalValue(date: Date): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function buildDefaultPromisedAt(): string {
  return toDateTimeLocalValue(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
}

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

function statCard(input: { title: string; value: string | number; detail: string }) {
  return (
    <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
      <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">{input.title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{input.value}</p>
      <p className="mt-2 text-sm text-stone-400">{input.detail}</p>
    </article>
  );
}

export default function AdminAlterationOrdersSubroute() {
  const [orders, setOrders] = useState<AlterationOrder[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [services, setServices] = useState<AlterationServiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [garmentDescription, setGarmentDescription] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [promisedAt, setPromisedAt] = useState(buildDefaultPromisedAt);
  const [notes, setNotes] = useState("");

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

  const activeServices = useMemo(
    () => services.filter((service) => service.activo),
    [services]
  );

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [ordersResponse, customersResponse, servicesResponse] = await Promise.all([
        fetch("/api/alteration-orders?page=1&pageSize=100&orderBy=createdAt&order=desc", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/customers", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/alteration-services", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (!ordersResponse.ok || !customersResponse.ok || !servicesResponse.ok) {
        setError("No se pudo cargar la data de alteraciones.");
        return;
      }

      const ordersPayload = (await ordersResponse.json()) as AlterationOrderListResponse;
      const customersPayload = (await customersResponse.json()) as CustomerOption[];
      const servicesPayload = (await servicesResponse.json()) as AlterationServiceOption[];

      setOrders(Array.isArray(ordersPayload.items) ? ordersPayload.items : []);
      setCustomers(Array.isArray(customersPayload) ? customersPayload : []);
      setServices(Array.isArray(servicesPayload) ? servicesPayload : []);
    } catch {
      setError("Error de red al cargar alteraciones.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshData();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setError(null);

    if (!customerId || !garmentDescription.trim() || !workDescription.trim()) {
      setError("Completa cliente, prenda y trabajo.");
      return;
    }

    setIsSubmitting(true);

    try {
      const promisedAtDate = promisedAt ? new Date(promisedAt) : null;
      if (promisedAt && (promisedAtDate === null || Number.isNaN(promisedAtDate.getTime()))) {
        setError("Fecha prometida invalida.");
        return;
      }

      const response = await fetch("/api/alteration-orders", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerId,
          serviceId: serviceId || undefined,
          garmentDescription: garmentDescription.trim(),
          workDescription: workDescription.trim(),
          promisedAt: promisedAtDate ? promisedAtDate.toISOString() : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        setError(await parseApiError(response, "No se pudo crear la orden de alteracion."));
        return;
      }

      setFeedback("Orden de alteracion creada.");
      setGarmentDescription("");
      setWorkDescription("");
      setNotes("");
      setPromisedAt(buildDefaultPromisedAt());
      await refreshData();
    } catch {
      setError("Error de red al crear la orden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderAction = async (orderId: string, action: string) => {
    setActiveOrderId(orderId);
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

      setFeedback("Estado de alteracion actualizado.");
      await refreshData();
    } catch {
      setError("Error de red al actualizar la orden.");
    } finally {
      setActiveOrderId(null);
    }
  };

  const activeOrders = orders.filter((order) =>
    ["RECIBIDO", "EN_EVALUACION", "EN_PROCESO", "LISTO"].includes(order.status)
  ).length;
  const completedOrders = orders.filter((order) => order.status === "ENTREGADO").length;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCard({
          title: "Alteraciones",
          value: orders.length,
          detail: "Ordenes registradas.",
        })}
        {statCard({
          title: "En curso",
          value: activeOrders,
          detail: "Pendientes de entrega final.",
        })}
        {statCard({
          title: "Entregadas",
          value: completedOrders,
          detail: "Ordenes finalizadas.",
        })}
        {statCard({
          title: "Servicios activos",
          value: activeServices.length,
          detail: "Disponibles para nuevas ordenes.",
        })}
      </div>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Nueva alteracion</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Crear orden de arreglo</h2>

        <form onSubmit={handleCreate} className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Cliente
            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
              required
            >
              <option value="">Selecciona cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.nombres} {customer.apellidos} - {customer.dni}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Servicio (opcional)
            <select
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
            >
              <option value="">Sin servicio base</option>
              {activeServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Prenda
            <input
              type="text"
              value={garmentDescription}
              onChange={(event) => setGarmentDescription(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Trabajo solicitado
            <input
              type="text"
              value={workDescription}
              onChange={(event) => setWorkDescription(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Fecha prometida
            <input
              type="datetime-local"
              value={promisedAt}
              onChange={(event) => setPromisedAt(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Nota
            <input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Opcional"
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-stone-500"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 inline-flex w-fit items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
          >
            {isSubmitting ? "Creando..." : "Crear orden de alteracion"}
          </button>
        </form>

        {feedback && (
          <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            {feedback}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}
      </article>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Listado</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Ordenes de alteracion</h2>
          </div>
          <button
            onClick={() => void refreshData()}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-stone-200 transition hover:bg-white/[0.06]"
          >
            Actualizar
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-stone-400">Cargando ordenes...</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500">
                <tr className="border-b border-white/8">
                  <th className="px-3 py-3 font-medium">Codigo</th>
                  <th className="px-3 py-3 font-medium">Cliente</th>
                  <th className="px-3 py-3 font-medium">Servicio</th>
                  <th className="px-3 py-3 font-medium">Fechas</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium text-right">Total</th>
                  <th className="px-3 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-stone-500">
                      No hay ordenes de alteracion registradas.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/6 align-top">
                      <td className="px-3 py-4">
                        <p className="font-medium text-white">{order.code}</p>
                        <p className="mt-1 text-xs text-stone-500">{order.garmentDescription}</p>
                      </td>
                      <td className="px-3 py-4 text-stone-200">
                        {customerById.get(order.customerId) ?? order.customerId}
                      </td>
                      <td className="px-3 py-4 text-stone-300">
                        {order.service?.nombre ?? "Sin servicio base"}
                      </td>
                      <td className="px-3 py-4 text-xs text-stone-400">
                        <p>Recibido: {formatMediumDate(order.receivedAt)}</p>
                        <p className="mt-1">Prometido: {formatMediumDate(order.promisedAt)}</p>
                        {order.deliveredAt && (
                          <p className="mt-1 text-emerald-300">
                            Entregado: {formatMediumDate(order.deliveredAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${alterationOrderStatusChipClasses(order.status)}`}
                        >
                          {formatStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right font-medium text-emerald-300">
                        S/ {Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/ordenes/alteraciones/${order.id}`}
                            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-stone-200 transition hover:bg-white/[0.06]"
                          >
                            Detalle
                          </Link>
                          {getAlterationActions(order.status).map((item) => (
                            <button
                              key={item.action}
                              onClick={() => void handleOrderAction(order.id, item.action)}
                              disabled={activeOrderId === order.id}
                              className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}
