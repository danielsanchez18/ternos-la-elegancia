export function customOrderStatusChipClasses(status: string): string {
  switch (status) {
    case "PENDIENTE_RESERVA":
      return "border-stone-500/20 bg-stone-500/10 text-stone-300";
    case "MEDIDAS_TOMADAS":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";
    case "EN_CONFECCION":
    case "EN_PRUEBA":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case "LISTO":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "ENTREGADO":
      return "border-purple-400/20 bg-purple-400/10 text-purple-300";
    case "CANCELADO":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    default:
      return "border-white/10 bg-white/5 text-stone-300";
  }
}

export function getCustomOrderItemCount(order: { items: Array<unknown> }): number {
  return order.items.length;
}

export function getCustomOrderPartsCount(order: {
  items: Array<{ parts: Array<unknown> }>;
}): number {
  return order.items.reduce((acc, item) => acc + item.parts.length, 0);
}

export function getCustomOrdersInWorkshopCount(
  orders: Array<{ status: string }>
): number {
  return orders.filter((order) =>
    ["EN_CONFECCION", "EN_PRUEBA"].includes(order.status)
  ).length;
}

export function getCustomOrdersRevenueTotal(
  orders: Array<{ total: number }>
): number {
  return orders.reduce((acc, order) => acc + Number(order.total), 0);
}
