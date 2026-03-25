/* eslint-disable @typescript-eslint/no-explicit-any */

export type DraftWorkMode = "A_TODO_COSTO" | "SOLO_CONFECCION";

export type Customer = {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string | null;
};

export type Fabric = {
  id: string;
  code: string;
  nombre: string;
  color: string | null;
};

export const GARMENT_TYPES = [
  "SACO_CABALLERO",
  "PANTALON_CABALLERO",
  "SACO_DAMA",
  "PANTALON_DAMA",
  "CAMISA",
  "BLUSA",
  "CHALECO",
  "FALDA",
  "SMOKING",
] as const;

export type CustomOrderPartDraft = {
  id: string;
  garmentType: string;
  label: string;
  workMode: DraftWorkMode;
  fabricId: string;
  unitPrice: number;
  notes: string;
  measurementProfileId: string;
  measurementProfileGarmentId: string;
};

export type CustomOrderItemDraft = {
  id: string;
  itemNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  notes: string;
  parts: CustomOrderPartDraft[];
};

export type CreateCustomOrderFormState = {
  customerId: string;
  requestedDeliveryAt: string;
  promisedDeliveryAt: string;
  notes: string;
  internalNotes: string;
};

export type EditCustomOrderFormState = {
  customerId: string;
  requestedDeliveryAt: string;
  promisedDeliveryAt: string;
  notes: string;
  internalNotes: string;
};

function createId() {
  return crypto.randomUUID();
}

export function createCustomOrderFormInitialState(): CreateCustomOrderFormState {
  return {
    customerId: "",
    requestedDeliveryAt: "",
    promisedDeliveryAt: "",
    notes: "",
    internalNotes: "",
  };
}

export function createCustomOrderDefaultPart(): CustomOrderPartDraft {
  return {
    id: createId(),
    garmentType: "SACO_CABALLERO",
    label: "Saco Principal",
    workMode: "A_TODO_COSTO",
    fabricId: "",
    unitPrice: 0,
    notes: "",
    measurementProfileId: "",
    measurementProfileGarmentId: "",
  };
}

export function createCustomOrderAdditionalPart(): CustomOrderPartDraft {
  return {
    id: createId(),
    garmentType: "PANTALON_CABALLERO",
    label: "Pantalón",
    workMode: "A_TODO_COSTO",
    fabricId: "",
    unitPrice: 0,
    notes: "",
    measurementProfileId: "",
    measurementProfileGarmentId: "",
  };
}

export function createCustomOrderDefaultItem(): CustomOrderItemDraft {
  return {
    id: createId(),
    itemNameSnapshot: "Terno a Medida",
    quantity: 1,
    unitPrice: 0,
    discountAmount: 0,
    notes: "",
    parts: [createCustomOrderDefaultPart()],
  };
}

export function createCustomOrderAdditionalItem(): CustomOrderItemDraft {
  return {
    id: createId(),
    itemNameSnapshot: "Prenda Adicional",
    quantity: 1,
    unitPrice: 0,
    discountAmount: 0,
    notes: "",
    parts: [],
  };
}

export function createCustomOrderInitialItems(): CustomOrderItemDraft[] {
  return [createCustomOrderDefaultItem()];
}

export function mapItemsFromExistingOrder(initialOrder: any): CustomOrderItemDraft[] {
  return initialOrder.items.map((item: any) => ({
    id: item.id || createId(),
    itemNameSnapshot: item.itemNameSnapshot,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    discountAmount: Number(item.discountAmount),
    notes: item.notes || "",
    parts: item.parts.map((part: any) => ({
      id: part.id || createId(),
      garmentType: part.garmentType,
      label: part.label,
      workMode: part.workMode,
      fabricId: part.fabricId?.toString() || "",
      unitPrice: part.unitPrice ? Number(part.unitPrice) : 0,
      notes: part.notes || "",
      measurementProfileId: "",
      measurementProfileGarmentId: "",
    })),
  }));
}

export function createEditCustomOrderFormState(
  initialOrder: any
): EditCustomOrderFormState {
  return {
    customerId: initialOrder.customerId.toString(),
    requestedDeliveryAt: initialOrder.requestedDeliveryAt
      ? new Date(initialOrder.requestedDeliveryAt).toISOString().split("T")[0]
      : "",
    promisedDeliveryAt: initialOrder.promisedDeliveryAt
      ? new Date(initialOrder.promisedDeliveryAt).toISOString().split("T")[0]
      : "",
    notes: initialOrder.notes || "",
    internalNotes: initialOrder.internalNotes || "",
  };
}

export function updateItemDraft(
  items: CustomOrderItemDraft[],
  index: number,
  key: string,
  value: any
): CustomOrderItemDraft[] {
  const next = [...items];
  (next[index] as any)[key] = value;
  return next;
}

export function updatePartDraft(
  items: CustomOrderItemDraft[],
  itemIndex: number,
  partIndex: number,
  key: string,
  value: any
): CustomOrderItemDraft[] {
  const next = [...items];
  (next[itemIndex].parts[partIndex] as any)[key] = value;
  return next;
}

export function addPartDraft(
  items: CustomOrderItemDraft[],
  itemIndex: number
): CustomOrderItemDraft[] {
  const next = [...items];
  next[itemIndex].parts.push(createCustomOrderAdditionalPart());
  return next;
}

export function removePartDraft(
  items: CustomOrderItemDraft[],
  itemIndex: number,
  partIndex: number
): CustomOrderItemDraft[] {
  const next = [...items];
  next[itemIndex].parts.splice(partIndex, 1);
  return next;
}

export function addItemDraft(items: CustomOrderItemDraft[]): CustomOrderItemDraft[] {
  return [...items, createCustomOrderAdditionalItem()];
}

export function removeItemDraft(
  items: CustomOrderItemDraft[],
  index: number
): CustomOrderItemDraft[] {
  const next = [...items];
  next.splice(index, 1);
  return next;
}

export function calculateCustomOrderTotal(items: CustomOrderItemDraft[]): number {
  return items.reduce(
    (acc, item) =>
      acc +
      (Number(item.unitPrice) * Number(item.quantity) - Number(item.discountAmount)),
    0
  );
}

export function getProfileGarments(
  customerProfiles: any[],
  measurementProfileId: string
) {
  return (
    customerProfiles.find((profile) => profile.id === measurementProfileId)
      ?.garments || []
  );
}

export function buildCreateCustomOrderPayload(
  form: CreateCustomOrderFormState,
  items: CustomOrderItemDraft[]
) {
  return {
    customerId: form.customerId,
    firstPurchaseFlow: false,
    requestedDeliveryAt: form.requestedDeliveryAt
      ? new Date(form.requestedDeliveryAt).toISOString()
      : undefined,
    promisedDeliveryAt: form.promisedDeliveryAt
      ? new Date(form.promisedDeliveryAt).toISOString()
      : undefined,
    notes: form.notes.trim() || undefined,
    internalNotes: form.internalNotes.trim() || undefined,
    items: items.map((item) => ({
      itemNameSnapshot: item.itemNameSnapshot,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      discountAmount: Number(item.discountAmount) || 0,
      notes: item.notes.trim() || undefined,
      parts: item.parts.map((part) => ({
        garmentType: part.garmentType,
        label: part.label,
        workMode: part.workMode,
        fabricId: part.fabricId || undefined,
        measurementProfileId: part.measurementProfileId || undefined,
        measurementProfileGarmentId:
          part.measurementProfileGarmentId || undefined,
        unitPrice: Number(part.unitPrice) || undefined,
        notes: part.notes.trim() || undefined,
        selections: [],
      })),
    })),
  };
}

export function buildUpdateCustomOrderPayload(
  form: EditCustomOrderFormState,
  items: CustomOrderItemDraft[]
) {
  return {
    requestedDeliveryAt: form.requestedDeliveryAt
      ? new Date(form.requestedDeliveryAt).toISOString()
      : undefined,
    promisedDeliveryAt: form.promisedDeliveryAt
      ? new Date(form.promisedDeliveryAt).toISOString()
      : undefined,
    notes: form.notes.trim() || undefined,
    internalNotes: form.internalNotes.trim() || undefined,
    items: items.map((item) => ({
      itemNameSnapshot: item.itemNameSnapshot,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      discountAmount: Number(item.discountAmount) || 0,
      notes: item.notes.trim() || undefined,
      parts: item.parts.map((part) => ({
        garmentType: part.garmentType,
        label: part.label,
        workMode: part.workMode,
        fabricId: part.fabricId || undefined,
        unitPrice: part.unitPrice ? Number(part.unitPrice) : undefined,
        notes: part.notes.trim() || undefined,
        selections: [],
      })),
    })),
  };
}

export function resolveCreateErrorMessage(responsePayload: any): string {
  if (responsePayload?.error?.message) {
    return responsePayload.error.message;
  }

  if (responsePayload?.error) {
    return typeof responsePayload.error === "string"
      ? responsePayload.error
      : JSON.stringify(responsePayload.error);
  }

  return "Error al crear orden";
}

export async function fetchCustomerProfiles(customerId: string): Promise<any[]> {
  const response = await fetch(`/api/customers/${customerId}/measurement-profiles`);

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as any[];
}
