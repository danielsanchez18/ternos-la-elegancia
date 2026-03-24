/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  MapPin,
  ScissorsLineDashed,
  Shirt,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

export const orderSectionIconsBySlug: Record<string, LucideIcon> = {
  venta: ShoppingBag,
  personalizadas: ScissorsLineDashed,
  rentas: Shirt,
  alteraciones: MapPin,
};

export function getOtherOrdersTotal(data: {
  sales: number;
  rentals: number;
  alterations: number;
}): number {
  return data.sales + data.rentals + data.alterations;
}

export function getOrdersRevenueTotal(orders: any[]): number {
  return orders.reduce((acc, order) => acc + Number(order.total), 0);
}

export function getOrdersInWorkshopTotal(orders: any[]): number {
  return orders.filter((order) =>
    ["EN_CONFECCION", "EN_PRUEBA"].includes(order.status)
  ).length;
}
