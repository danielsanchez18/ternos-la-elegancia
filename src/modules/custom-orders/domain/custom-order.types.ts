import {
  CustomOrderStatus,
  FabricPriceMode,
  InputFieldType,
  MeasurementGarmentType,
  Prisma,
} from "@prisma/client";

export type CustomOrderAction =
  | "CONFIRM_RESERVATION"
  | "MARK_MEASUREMENTS_TAKEN"
  | "START_CONFECTION"
  | "START_FITTING"
  | "MARK_READY"
  | "MARK_DELIVERED"
  | "CANCEL"
  | "LINK_MEASUREMENT";

export type ListCustomOrdersFilters = {
  customerId?: string;
  status?: CustomOrderStatus;
  code?: string;
  requiresMeasurement?: boolean;
  firstPurchaseFlow?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  promisedFrom?: Date;
  promisedTo?: Date;
  page: number;
  pageSize: number;
  orderBy: "createdAt" | "promisedDeliveryAt" | "total";
  order: "asc" | "desc";
};

export type CustomOrderListResult = {
  items: PublicCustomOrder[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type CreateCustomOrderSelectionInput = {
  definitionId: string;
  optionId?: string;
  valueText?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
};

export type CreateCustomOrderPartInput = {
  productId?: string;
  garmentType: MeasurementGarmentType;
  label: string;
  workMode?: FabricPriceMode;
  measurementProfileId?: string;
  measurementProfileGarmentId?: string;
  fabricId?: string;
  unitPrice?: number;
  notes?: string;
  selections?: CreateCustomOrderSelectionInput[];
};

export type CreateCustomOrderItemInput = {
  productId?: string;
  itemNameSnapshot?: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  notes?: string;
  parts: CreateCustomOrderPartInput[];
};

export type CreateCustomOrderInput = {
  customerId: string;
  firstPurchaseFlow?: boolean;
  requestedDeliveryAt?: Date;
  promisedDeliveryAt?: Date;
  notes?: string;
  internalNotes?: string;
  items: CreateCustomOrderItemInput[];
};

export type CustomOrderActionInput = {
  action: CustomOrderAction;
  note?: string;
  partId?: string;
  profileId?: string;
  profileGarmentId?: string;
};

export type UpdateCustomOrderInput = Partial<Omit<CreateCustomOrderInput, "customerId">> & {
  // We can add specific update logic for items if we want partial updates,
  // but for now let's assume we can update the main fields.
  // Full item replacement is usually easier for custom orders.
};

export type PublicCustomOrder = {
  id: string;
  customerId: string;
  code: string;
  status: CustomOrderStatus;
  requiresMeasurement: boolean;
  measurementRequiredUntil: Date | null;
  firstPurchaseFlow: boolean;
  subtotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  total: Prisma.Decimal;
  requestedDeliveryAt: Date | null;
  promisedDeliveryAt: Date | null;
  deliveredAt: Date | null;
  notes: string | null;
  internalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    productId: string | null;
    itemNameSnapshot: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    subtotal: Prisma.Decimal;
    notes: string | null;
    parts: {
      id: string;
      productId: string | null;
      garmentType: MeasurementGarmentType;
      label: string;
      workMode: FabricPriceMode;
      measurementProfileId: string | null;
      measurementProfileGarmentId: string | null;
      fabricId: string | null;
      fabricNameSnapshot: string | null;
      fabricCodeSnapshot: string | null;
      fabricColorSnapshot: string | null;
      unitPrice: Prisma.Decimal | null;
      notes: string | null;
      selections: {
        id: string;
        definitionId: string;
        optionId: string | null;
        definitionCodeSnapshot: string;
        definitionLabelSnapshot: string;
        inputTypeSnapshot: InputFieldType;
        optionCodeSnapshot: string | null;
        optionLabelSnapshot: string | null;
        extraPriceSnapshot: Prisma.Decimal | null;
        valueText: string | null;
        valueNumber: Prisma.Decimal | null;
        valueBoolean: boolean | null;
      }[];
    }[];
  }[];
};
