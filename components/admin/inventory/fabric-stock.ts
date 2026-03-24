import type { FabricListItem } from "@/components/admin/inventory/types";

export function getFabricStockStatus(fabric: FabricListItem) {
  const stockValue = Number(fabric.metersInStock);
  const minStock = Number(fabric.minMeters);
  const isLowStock = stockValue <= minStock && stockValue > 0;
  const isOutOfStock = stockValue <= 0;

  return {
    stockValue,
    minStock,
    isLowStock,
    isOutOfStock,
  };
}
