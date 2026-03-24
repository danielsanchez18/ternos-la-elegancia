export type MeasurementGarmentType =
  | "SACO_CABALLERO"
  | "PANTALON_CABALLERO"
  | "SACO_DAMA"
  | "PANTALON_DAMA"
  | "CAMISA"
  | "BLUSA"
  | "CHALECO"
  | "FALDA"
  | "SMOKING";

export const GARMENT_OPTIONS: Array<{
  value: MeasurementGarmentType;
  label: string;
}> = [
  { value: "SACO_CABALLERO", label: "Saco caballero" },
  { value: "PANTALON_CABALLERO", label: "Pantalón caballero" },
  { value: "SACO_DAMA", label: "Saco dama" },
  { value: "PANTALON_DAMA", label: "Pantalón dama" },
  { value: "CAMISA", label: "Camisa" },
  { value: "BLUSA", label: "Blusa" },
  { value: "CHALECO", label: "Chaleco" },
  { value: "FALDA", label: "Falda" },
  { value: "SMOKING", label: "Smoking" },
];

export const GARMENT_LABELS: Record<MeasurementGarmentType, string> = {
  SACO_CABALLERO: "Saco",
  PANTALON_CABALLERO: "Pantalón",
  SACO_DAMA: "Saco",
  PANTALON_DAMA: "Pantalón",
  CAMISA: "Camisa",
  BLUSA: "Blusa",
  CHALECO: "Chaleco",
  FALDA: "Falda",
  SMOKING: "Smoking",
};
