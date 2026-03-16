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
  | "CANCEL";

export type ListCustomOrdersFilters = {
  customerId?: number;
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
  definitionId: number;
  optionId?: number;
  valueText?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
};

export type CreateCustomOrderPartInput = {
  productId?: number;
  garmentType: MeasurementGarmentType;
  label: string;
  workMode?: FabricPriceMode;
  measurementProfileId?: number;
  measurementProfileGarmentId?: number;
  fabricId?: number;
  unitPrice?: number;
  notes?: string;
  selections?: CreateCustomOrderSelectionInput[];
};

export type CreateCustomOrderItemInput = {
  productId?: number;
  itemNameSnapshot?: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  notes?: string;
  parts: CreateCustomOrderPartInput[];
};

export type CreateCustomOrderInput = {
  customerId: number;
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
};

export type PublicCustomOrder = {
  id: number;
  customerId: number;
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
    id: number;
    productId: number | null;
    itemNameSnapshot: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    subtotal: Prisma.Decimal;
    notes: string | null;
    parts: {
      id: number;
      productId: number | null;
      garmentType: MeasurementGarmentType;
      label: string;
      workMode: FabricPriceMode;
      measurementProfileId: number | null;
      measurementProfileGarmentId: number | null;
      fabricId: number | null;
      fabricNameSnapshot: string | null;
      fabricCodeSnapshot: string | null;
      fabricColorSnapshot: string | null;
      unitPrice: Prisma.Decimal | null;
      notes: string | null;
      selections: {
        id: number;
        definitionId: number;
        optionId: number | null;
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
