"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { formatMediumDate, formatStatusLabel } from "@/components/admin/orders/custom-order-shared";
import { rentalOrderStatusChipClasses } from "@/components/admin/orders/order-status-styles";

type CustomerOption = {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
};

type ProductOption = {
  id: string;
  nombre: string;
  kind: string;
  allowsRental: boolean;
  active: boolean;
};

type RentalUnitListItem = {
  id: string;
  productId: string;
  variantId: string | null;
  internalCode: string;
  sizeLabel: string | null;
  color: string | null;
  status: string;
  currentTier: string;
  normalPrice: string | number;
  premierePrice: string | number;
};

type RentalOrderItem = {
  id: string;
  rentalUnitId: string;
  itemNameSnapshot: string;
  tierAtRental: string;
  unitPrice: string | number;
};

type RentalOrderListItem = {
  id: string;
  customerId: string;
  code: string;
  status: string;
  total: string | number;
  pickupAt: string;
  dueBackAt: string;
  returnedAt: string | null;
  items: RentalOrderItem[];
};

type RentalOrderListResponse = {
  items: RentalOrderListItem[];
};

type RentalRequestRow = {
  rowId: string;
  productId: string;
  sizeKey: string;
  quantity: number;
};

type SizeOption = {
  sizeKey: string;
  label: string;
  totalCount: number;
  availableCount: number;
};

const NO_SIZE_KEY = "__NO_SIZE__";

function toDateTimeLocalValue(date: Date): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function buildDefaultDueBackAt(): string {
  return toDateTimeLocalValue(new Date(Date.now() + 2 * 60 * 60 * 1000));
}

function createRentalRequestRow(): RentalRequestRow {
  return {
    rowId: `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
    productId: "",
    sizeKey: "",
    quantity: 1,
  };
}

function normalizeSizeLabel(label: string | null | undefined): string {
  const normalized = (label ?? "").trim();
  return normalized ? normalized : "Sin talla";
}

function toSizeKey(label: string | null | undefined): string {
  const normalized = (label ?? "").trim().toLowerCase();
  return normalized || NO_SIZE_KEY;
}

function buildComboKey(productId: string, sizeKey: string): string {
  return `${productId}::${sizeKey}`;
}

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

function statCard(input: { title: string; value: string | number; detail: string }) {
  return (
    <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
      <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">{input.title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{input.value}</p>
      <p className="mt-2 text-sm text-stone-400">{input.detail}</p>
    </article>
  );
}

function summarizeOrderItems(items: RentalOrderItem[]): string {
  if (items.length === 0) {
    return "Sin items";
  }

  const names = Array.from(new Set(items.map((item) => item.itemNameSnapshot).filter(Boolean)));
  if (names.length === 0) {
    return `${items.length} item(s)`;
  }

  if (names.length === 1) {
    return names[0];
  }

  return `${names.slice(0, 2).join(" + ")}${names.length > 2 ? "..." : ""}`;
}

export default function AdminRentalOrdersSubroute() {
  const [orders, setOrders] = useState<RentalOrderListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [rentalUnits, setRentalUnits] = useState<RentalUnitListItem[]>([]);
  const [requestRows, setRequestRows] = useState<RentalRequestRow[]>([createRentalRequestRow()]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnHasDamage, setReturnHasDamage] = useState(false);
  const [returnNotes, setReturnNotes] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [dueBackAt, setDueBackAt] = useState(buildDefaultDueBackAt);
  const [notes, setNotes] = useState("");

  const availableUnits = useMemo(
    () => rentalUnits.filter((unit) => unit.status === "DISPONIBLE"),
    [rentalUnits]
  );

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

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const availableCountByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const unit of availableUnits) {
      map.set(unit.productId, (map.get(unit.productId) ?? 0) + 1);
    }
    return map;
  }, [availableUnits]);

  const sizeOptionsByProduct = useMemo(() => {
    const totalMap = new Map<string, number>();
    const availableMap = new Map<string, number>();
    const labelByProductSize = new Map<string, string>();

    for (const unit of rentalUnits) {
      const sizeKey = toSizeKey(unit.sizeLabel);
      const comboKey = buildComboKey(unit.productId, sizeKey);
      totalMap.set(comboKey, (totalMap.get(comboKey) ?? 0) + 1);
      labelByProductSize.set(comboKey, normalizeSizeLabel(unit.sizeLabel));
    }

    for (const unit of availableUnits) {
      const sizeKey = toSizeKey(unit.sizeLabel);
      const comboKey = buildComboKey(unit.productId, sizeKey);
      availableMap.set(comboKey, (availableMap.get(comboKey) ?? 0) + 1);
    }

    const map = new Map<string, SizeOption[]>();
    for (const [comboKey, totalCount] of totalMap) {
      const [productId, sizeKey] = comboKey.split("::");
      const current = map.get(productId) ?? [];
      current.push({
        sizeKey,
        label: labelByProductSize.get(comboKey) ?? "Sin talla",
        totalCount,
        availableCount: availableMap.get(comboKey) ?? 0,
      });
      map.set(productId, current);
    }

    for (const [productId, options] of map) {
      options.sort((a, b) => a.label.localeCompare(b.label, "es"));
      map.set(productId, options);
    }

    return map;
  }, [rentalUnits, availableUnits]);

  const availableCountByCombo = useMemo(() => {
    const map = new Map<string, number>();
    for (const unit of availableUnits) {
      const sizeKey = toSizeKey(unit.sizeLabel);
      const comboKey = buildComboKey(unit.productId, sizeKey);
      map.set(comboKey, (map.get(comboKey) ?? 0) + 1);
    }
    return map;
  }, [availableUnits]);

  const rentalEnabledProducts = useMemo(
    () => products.filter((product) => product.active && product.allowsRental),
    [products]
  );

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [ordersResponse, customersResponse, unitsResponse, productsResponse] =
        await Promise.all([
          fetch("/api/rental-orders?page=1&pageSize=100&orderBy=createdAt&order=desc", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/customers", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/rental-units", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/products?active=true&allowsRental=true", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),
        ]);

      if (!ordersResponse.ok || !customersResponse.ok || !unitsResponse.ok || !productsResponse.ok) {
        setError("No se pudo cargar la data de rentas.");
        return;
      }

      const ordersPayload = (await ordersResponse.json()) as RentalOrderListResponse;
      const customersPayload = (await customersResponse.json()) as CustomerOption[];
      const unitsPayload = (await unitsResponse.json()) as RentalUnitListItem[];
      const productsPayload = (await productsResponse.json()) as ProductOption[];

      setOrders(Array.isArray(ordersPayload.items) ? ordersPayload.items : []);
      setCustomers(Array.isArray(customersPayload) ? customersPayload : []);
      setRentalUnits(Array.isArray(unitsPayload) ? unitsPayload : []);
      setProducts(Array.isArray(productsPayload) ? productsPayload : []);
    } catch {
      setError("Error de red al cargar rentas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshData();
  }, []);

  const updateRequestRow = (rowId: string, updater: (row: RentalRequestRow) => RentalRequestRow) => {
    setRequestRows((current) => current.map((row) => (row.rowId === rowId ? updater(row) : row)));
  };

  const handleChangeRowProduct = (rowId: string, nextProductId: string) => {
    const productSizes = sizeOptionsByProduct.get(nextProductId) ?? [];
    const preferredSize =
      productSizes.find((option) => option.availableCount > 0)?.sizeKey ??
      productSizes[0]?.sizeKey ??
      "";

    updateRequestRow(rowId, (row) => ({
      ...row,
      productId: nextProductId,
      sizeKey: preferredSize,
      quantity: 1,
    }));
  };

  const handleCreateOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setError(null);

    if (!customerId) {
      setError("Selecciona cliente.");
      return;
    }

    if (requestRows.length === 0) {
      setError("Agrega al menos una prenda.");
      return;
    }

    const dueBackAtDate = new Date(dueBackAt);
    if (Number.isNaN(dueBackAtDate.getTime())) {
      setError("Fecha de devolucion invalida.");
      return;
    }

    const demandByCombo = new Map<
      string,
      { productId: string; sizeKey: string; quantity: number }
    >();

    for (const row of requestRows) {
      if (!row.productId || !row.sizeKey) {
        setError("Completa producto y talla en todas las filas.");
        return;
      }

      if (!Number.isFinite(row.quantity) || row.quantity < 1) {
        setError("La cantidad por fila debe ser al menos 1.");
        return;
      }

      const comboKey = buildComboKey(row.productId, row.sizeKey);
      const current = demandByCombo.get(comboKey);
      demandByCombo.set(comboKey, {
        productId: row.productId,
        sizeKey: row.sizeKey,
        quantity: (current?.quantity ?? 0) + row.quantity,
      });
    }

    for (const demand of demandByCombo.values()) {
      const comboKey = buildComboKey(demand.productId, demand.sizeKey);
      const availableCount = availableCountByCombo.get(comboKey) ?? 0;
      if (demand.quantity > availableCount) {
        const productName = productById.get(demand.productId)?.nombre ?? "Producto";
        const sizeLabel =
          demand.sizeKey === NO_SIZE_KEY ? "Sin talla" : demand.sizeKey.toUpperCase();
        setError(
          `Stock insuficiente para ${productName} (${sizeLabel}). Disponibles: ${availableCount}, solicitados: ${demand.quantity}.`
        );
        return;
      }
    }

    const availableUnitsByCombo = new Map<string, RentalUnitListItem[]>();
    for (const unit of availableUnits) {
      const comboKey = buildComboKey(unit.productId, toSizeKey(unit.sizeLabel));
      const current = availableUnitsByCombo.get(comboKey) ?? [];
      current.push(unit);
      availableUnitsByCombo.set(comboKey, current);
    }

    const items: Array<{ rentalUnitId: string }> = [];
    for (const demand of demandByCombo.values()) {
      const comboKey = buildComboKey(demand.productId, demand.sizeKey);
      const candidates = availableUnitsByCombo.get(comboKey) ?? [];
      const selected = candidates.slice(0, demand.quantity);

      if (selected.length < demand.quantity) {
        setError("No se pudo asignar unidades suficientes para una de las filas.");
        return;
      }

      for (const unit of selected) {
        items.push({ rentalUnitId: unit.id });
      }
    }

    if (items.length === 0) {
      setError("No hay unidades para registrar en la orden.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rental-orders", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerId,
          dueBackAt: dueBackAtDate.toISOString(),
          notes: notes.trim() || undefined,
          items,
        }),
      });

      if (!response.ok) {
        setError(await parseApiError(response, "No se pudo crear la orden de renta."));
        return;
      }

      setFeedback("Orden de renta creada correctamente.");
      setRequestRows([createRentalRequestRow()]);
      setNotes("");
      setDueBackAt(buildDefaultDueBackAt());
      await refreshData();
    } catch {
      setError("Error de red al crear la orden de renta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderAction = async (orderId: string, action: string) => {
    if (action === "MARK_RETURNED") {
      setReturnOrderId(orderId);
      setReturnHasDamage(false);
      setReturnNotes("");
      return;
    }

    setActiveOrderId(orderId);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(`/api/rental-orders/${orderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        setError(await parseApiError(response, "No se pudo actualizar la orden."));
        return;
      }

      setFeedback("Estado de renta actualizado.");
      await refreshData();
    } catch {
      setError("Error de red al actualizar la orden.");
    } finally {
      setActiveOrderId(null);
    }
  };

  const handleConfirmReturn = async () => {
    if (!returnOrderId) return;

    setActiveOrderId(returnOrderId);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(`/api/rental-orders/${returnOrderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "MARK_RETURNED",
          hasDamage: returnHasDamage,
          returnNotes: returnNotes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        setError(await parseApiError(response, "No se pudo registrar la devolucion."));
        return;
      }

      setFeedback("Devolucion registrada correctamente.");
      setReturnOrderId(null);
      await refreshData();
    } catch {
      setError("Error de red al registrar devolucion.");
    } finally {
      setActiveOrderId(null);
    }
  };

  const activeOrders = orders.filter((order) =>
    ["ENTREGADO", "ATRASADO"].includes(order.status)
  ).length;
  const returnedOrders = orders.filter((order) => order.status === "DEVUELTO").length;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCard({
          title: "Rentas totales",
          value: orders.length,
          detail: "Ordenes registradas en el modulo.",
        })}
        {statCard({
          title: "Rentas activas",
          value: activeOrders,
          detail: "Ordenes en curso o con retraso.",
        })}
        {statCard({
          title: "Pendientes de cierre",
          value: returnedOrders,
          detail: "Ordenes devueltas sin cerrar.",
        })}
        {statCard({
          title: "Unidades disponibles",
          value: availableUnits.length,
          detail: "Stock real disponible por talla.",
        })}
      </div>

      <article className="rounded-[1.75rem] border border-cyan-400/20 bg-cyan-400/5 p-5">
        <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200">Flujo recomendado</p>
        <p className="mt-2 text-sm leading-6 text-cyan-100/90">
          1) Registra productos de renta en catalogo, 2) registra unidades fisicas por talla en inventario,
          3) crea la orden desde aqui seleccionando producto+talla+cantidad.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admin/catalogo/productos"
            className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-300/20"
          >
            Ir a Catalogo / Productos
          </Link>
          <Link
            href="/admin/inventario/unidades-renta"
            className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-300/20"
          >
            Ir a Inventario / Unidades de renta
          </Link>
        </div>
      </article>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Nueva renta</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Crear orden inmediata</h2>
        <p className="mt-2 text-sm text-stone-400">
          Puedes combinar tallas en una misma orden, por ejemplo saco 48 + pantalon 42.
        </p>

        <form onSubmit={handleCreateOrder} className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
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
              Devolucion pactada
              <input
                type="datetime-local"
                value={dueBackAt}
                onChange={(event) => setDueBackAt(event.target.value)}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
                required
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
          </div>

          <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">Prendas y tallas</p>
              <button
                type="button"
                onClick={() => setRequestRows((current) => [...current, createRentalRequestRow()])}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-stone-200 transition hover:bg-white/[0.06]"
              >
                Agregar fila
              </button>
            </div>

            {requestRows.map((row, index) => {
              const sizeOptions = row.productId ? sizeOptionsByProduct.get(row.productId) ?? [] : [];
              const comboKey = row.productId && row.sizeKey ? buildComboKey(row.productId, row.sizeKey) : "";
              const availableCount = comboKey ? availableCountByCombo.get(comboKey) ?? 0 : 0;
              const product = productById.get(row.productId);

              return (
                <div
                  key={row.rowId}
                  className="grid gap-3 rounded-xl border border-white/8 bg-black/20 p-3 md:grid-cols-[1.25fr_1fr_0.5fr_auto]"
                >
                  <label className="flex flex-col gap-1 text-xs text-stone-300">
                    Producto
                    <select
                      value={row.productId}
                      onChange={(event) => handleChangeRowProduct(row.rowId, event.target.value)}
                      className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                      required
                    >
                      <option value="">Selecciona producto</option>
                      {rentalEnabledProducts.map((productOption) => {
                        const productAvailable = availableCountByProduct.get(productOption.id) ?? 0;
                        const label = `${productOption.nombre} (${productAvailable} disp.)`;
                        return (
                          <option
                            key={productOption.id}
                            value={productOption.id}
                            disabled={productAvailable === 0}
                          >
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-stone-300">
                    Talla
                    <select
                      value={row.sizeKey}
                      onChange={(event) =>
                        updateRequestRow(row.rowId, (current) => ({
                          ...current,
                          sizeKey: event.target.value,
                          quantity: 1,
                        }))
                      }
                      className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                      required
                      disabled={!row.productId}
                    >
                      <option value="">Selecciona talla</option>
                      {sizeOptions.map((option) => (
                        <option
                          key={option.sizeKey}
                          value={option.sizeKey}
                          disabled={option.availableCount === 0}
                        >
                          {option.label} ({option.availableCount}/{option.totalCount})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-stone-300">
                    Cantidad
                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(event) => {
                        const parsed = Number.parseInt(event.target.value, 10);
                        updateRequestRow(row.rowId, (current) => ({
                          ...current,
                          quantity:
                            Number.isFinite(parsed) && parsed > 0
                              ? parsed
                              : 1,
                        }));
                      }}
                      className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                      required
                    />
                  </label>

                  <div className="flex items-end gap-2">
                    <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-2 text-[11px] text-cyan-100">
                      {row.productId && row.sizeKey
                        ? `Disponibles: ${availableCount}`
                        : "Sin seleccion"}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setRequestRows((current) =>
                          current.length === 1
                            ? [createRentalRequestRow()]
                            : current.filter((item) => item.rowId !== row.rowId)
                        )
                      }
                      className="rounded-lg border border-rose-300/20 bg-rose-300/10 px-2.5 py-2 text-xs text-rose-100 transition hover:bg-rose-300/20"
                    >
                      {requestRows.length === 1 ? "Limpiar" : "Quitar"}
                    </button>
                  </div>

                  {product && (
                    <p className="md:col-span-4 text-[11px] text-stone-500">
                      {index + 1}. {product.nombre} ({product.kind})
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-fit items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
          >
            {isSubmitting ? "Creando..." : "Crear orden de renta"}
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
            <h2 className="mt-2 text-xl font-semibold text-white">Ordenes de renta</h2>
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
                  <th className="px-3 py-3 font-medium">Fechas</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium text-right">Total</th>
                  <th className="px-3 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-stone-500">
                      No hay rentas registradas.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const actions = getRentalActions(order.status);
                    return (
                      <tr key={order.id} className="border-b border-white/6 align-top">
                        <td className="px-3 py-4">
                          <p className="font-medium text-white">{order.code}</p>
                          <p className="mt-1 text-xs text-stone-500">
                            {order.items.length} item(s)
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <p className="text-sm text-stone-200">
                            {customerById.get(order.customerId) ?? order.customerId}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            {summarizeOrderItems(order.items)}
                          </p>
                        </td>
                        <td className="px-3 py-4 text-xs text-stone-400">
                          <p>Salida: {formatMediumDate(order.pickupAt)}</p>
                          <p className="mt-1">Dev: {formatMediumDate(order.dueBackAt)}</p>
                          {order.returnedAt && (
                            <p className="mt-1 text-emerald-300">
                              Real: {formatMediumDate(order.returnedAt)}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${rentalOrderStatusChipClasses(order.status)}`}
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
                              href={`/admin/ordenes/rentas/${order.id}`}
                              className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-stone-200 transition hover:bg-white/[0.06]"
                            >
                              Detalle
                            </Link>
                            {actions.map((item) => (
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {returnOrderId && (
          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200">Confirmar devolucion</p>
            <p className="mt-2 text-sm text-stone-300">
              Orden: <span className="font-medium text-white">{orders.find((o) => o.id === returnOrderId)?.code ?? returnOrderId}</span>
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-2 self-center text-sm text-stone-300">
                <input
                  type="checkbox"
                  checked={returnHasDamage}
                  onChange={(event) => setReturnHasDamage(event.target.checked)}
                  className="size-4 rounded border border-white/20 bg-transparent accent-rose-400"
                />
                Tiene danio
              </label>

              <label className="flex flex-col gap-1 text-sm text-stone-300">
                Observaciones de devolucion
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(event) => setReturnNotes(event.target.value)}
                  placeholder="Opcional"
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-stone-500"
                />
              </label>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => void handleConfirmReturn()}
                  disabled={activeOrderId === returnOrderId}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
                >
                  Confirmar devolucion
                </button>
                <button
                  onClick={() => setReturnOrderId(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-stone-200 transition hover:bg-white/[0.06]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
