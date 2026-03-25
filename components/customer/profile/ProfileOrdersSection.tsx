"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getMyCustomOrders,
  getMyRentalOrders,
  type CustomerOrder,
  type CustomerRentalOrder,
} from "@/lib/storefront-customer-api";

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function statusColor(status: string): string {
  const s = status.toUpperCase();
  if (["ENTREGADO", "CERRADO", "COMPLETADO"].includes(s))
    return "border-emerald-300/30 bg-emerald-50 text-emerald-700";
  if (["CANCELADO"].includes(s))
    return "border-neutral-300 bg-neutral-100 text-neutral-500";
  if (["ATRASADO"].includes(s))
    return "border-rose-300/30 bg-rose-50 text-rose-700";
  return "border-amber-300/30 bg-amber-50 text-amber-700";
}

export default function ProfileOrdersSection({
  customerId,
}: {
  customerId: string;
}) {
  const [customOrders, setCustomOrders] = useState<CustomerOrder[]>([]);
  const [rentalOrders, setRentalOrders] = useState<CustomerRentalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set of opened order IDs (both custom and rental)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrder = (id: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [custom, rental] = await Promise.all([
          getMyCustomOrders(customerId),
          getMyRentalOrders(customerId),
        ]);
        if (!isMounted) return;
        setCustomOrders(custom);
        setRentalOrders(rental);
      } catch {
        if (isMounted) setError("No se pudieron cargar tus ordenes.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [customerId]);

  const totalOrders = customOrders.length + rentalOrders.length;

  return (
    <article className="border border-black/10 bg-white p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
        Mis ordenes
      </p>
      <h2 className="mt-2 text-2xl font-oswald uppercase text-neutral-950">
        Historial de pedidos
      </h2>

      {isLoading ? (
        <p className="mt-6 text-sm text-neutral-500">Cargando ordenes...</p>
      ) : error ? (
        <p className="mt-6 text-sm text-amber-700">{error}</p>
      ) : totalOrders === 0 ? (
        <p className="mt-6 text-sm text-neutral-600">
          Aun no tienes ordenes registradas.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {customOrders.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-3 border-b border-black/10 pb-2">
                Pedidos a medida
              </p>
              <div className="space-y-3">
                {customOrders.map((order) => {
                  const isExpanded = expandedOrders.has(order.id);
                  return (
                    <div key={order.id} className="border border-neutral-200">
                      <button
                        type="button"
                        onClick={() => toggleOrder(order.id)}
                        className="flex w-full items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {order.code}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {formatDate(order.createdAt)} · {order.items.length} item(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`inline-flex border px-2 py-0.5 text-[10px] uppercase tracking-wide ${statusColor(order.status)}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                          <span className="text-sm font-semibold text-neutral-900 min-w-[80px] text-right">
                            S/ {Number(order.total).toFixed(2)}
                          </span>
                          <span className="text-neutral-400 text-xs">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 py-4 border-t border-neutral-200 bg-white">
                          <p className="text-xs font-semibold uppercase text-neutral-900 mb-3">Detalle del Pedido</p>
                          {order.items.length === 0 ? (
                            <p className="text-sm text-neutral-500">Sin items registrados.</p>
                          ) : (
                            <ul className="space-y-2">
                              {order.items.map((item, idx) => (
                                <li key={item.id} className="flex justify-between text-sm py-1 border-b border-neutral-100 last:border-0 last:pb-0">
                                  <span className="text-neutral-600">{idx + 1}. {item.garmentLabel}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {rentalOrders.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-3 border-b border-black/10 pb-2">
                Pedidos de renta
              </p>
              <div className="space-y-3">
                {rentalOrders.map((order) => {
                  const isExpanded = expandedOrders.has(order.id);
                  return (
                    <div key={order.id} className="border border-neutral-200">
                      <button
                        type="button"
                        onClick={() => toggleOrder(order.id)}
                        className="flex w-full items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {order.code}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            Salida: {formatDate(order.pickupAt)} · Dev: {formatDate(order.dueBackAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`inline-flex border px-2 py-0.5 text-[10px] uppercase tracking-wide ${statusColor(order.status)}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                          <span className="text-sm font-semibold text-neutral-900 min-w-[80px] text-right">
                            S/ {Number(order.total).toFixed(2)}
                          </span>
                          <span className="text-neutral-400 text-xs">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 py-4 border-t border-neutral-200 bg-white">
                          <p className="text-xs font-semibold uppercase text-neutral-900 mb-3">Items Rentados</p>
                          {order.items.length === 0 ? (
                            <p className="text-sm text-neutral-500">Sin prendas rentadas.</p>
                          ) : (
                            <ul className="space-y-2">
                              {order.items.map((item, idx) => (
                                <li key={item.id} className="flex justify-between text-sm py-1 border-b border-neutral-100 last:border-0 last:pb-0">
                                  <div>
                                    <span className="text-neutral-900 block">{item.itemNameSnapshot}</span>
                                    <span className="text-[10px] text-neutral-500 uppercase">Tier: {item.tierAtRental}</span>
                                  </div>
                                  <span className="text-neutral-600">S/ {Number(item.unitPrice).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {order.returnedAt && (
                            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 text-sm">
                              <span className="text-emerald-800 block text-xs font-semibold uppercase mb-1">Devuelto</span>
                              <span className="text-emerald-700">{formatDate(order.returnedAt)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
