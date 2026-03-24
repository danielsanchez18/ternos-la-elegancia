export type NumericLike = number | string;

export type AdminFabricActionData = {
  id: number;
  code: string;
  nombre: string;
  color: string | null;
  supplier: string | null;
  composition: string | null;
  pattern: string | null;
  metersInStock: NumericLike;
  minMeters: NumericLike;
  costPerMeter: NumericLike | null;
  pricePerMeter: NumericLike | null;
  active: boolean;
};

export type FabricListItem = {
  id: number;
  code: string;
  nombre: string;
  color: string | null;
  supplier: string | null;
  composition: string | null;
  pattern: string | null;
  metersInStock: NumericLike;
  minMeters: NumericLike;
  costPerMeter: NumericLike | null;
  pricePerMeter: NumericLike | null;
  active: boolean;
  updatedAt: Date | string;
  _count: {
    movements: number;
    customParts: number;
  };
};

export type FabricMovementType = "INGRESO" | "SALIDA" | "AJUSTE" | "MERMA" | "CONFECCION";

export type FabricMovement = {
  id: number;
  type: FabricMovementType;
  quantity: NumericLike;
  note: string | null;
  happenedAt: string;
};
