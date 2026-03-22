import { MeasurementGarmentType } from "@prisma/client";

/**
 * Consumo estándar de tela en metros por cada tipo de prenda.
 * Estos valores son referenciales para la sastrería.
 */
export const GARMENT_FABRIC_CONSUMPTION: Record<MeasurementGarmentType, number> = {
  SACO_CABALLERO: 2.0,
  PANTALON_CABALLERO: 1.5,
  SACO_DAMA: 1.8,
  PANTALON_DAMA: 1.4,
  CAMISA: 1.6,
  BLUSA: 1.5,
  CHALECO: 0.8,
  FALDA: 1.0,
  SMOKING: 2.5,
};

export const DEFAULT_FABRIC_CONSUMPTION = 1.5;
