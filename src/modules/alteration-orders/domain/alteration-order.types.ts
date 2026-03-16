import { AlterationOrderStatus, Prisma } from "@prisma/client";

export type AlterationOrderAction =
  | "START_EVALUATION"
  | "START_WORK"
  | "MARK_READY"
  | "MARK_DELIVERED"
  | "CANCEL";

export type ListAlterationOrdersFilters = {
  customerId?: number;
  serviceId?: number;
  status?: AlterationOrderStatus;
  code?: string;
  receivedFrom?: Date;
  receivedTo?: Date;
  promisedFrom?: Date;
  promisedTo?: Date;
  page: number;
  pageSize: number;
  orderBy: "createdAt" | "receivedAt" | "promisedAt" | "total";
  order: "asc" | "desc";
};

export type AlterationOrderListResult = {
  items: PublicAlterationOrder[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type CreateAlterationOrderInput = {
  customerId: number;
  serviceId?: number;
  garmentDescription: string;
  workDescription: string;
  initialCondition?: string;
  receivedAt?: Date;
  promisedAt?: Date;
  subtotal?: number;
  discountTotal?: number;
  notes?: string;
};

export type AlterationOrderActionInput = {
  action: AlterationOrderAction;
  note?: string;
};

export type PublicAlterationOrder = {
  id: number;
  customerId: number;
  code: string;
  status: AlterationOrderStatus;
  serviceId: number | null;
  garmentDescription: string;
  workDescription: string;
  initialCondition: string | null;
  receivedAt: Date;
  promisedAt: Date | null;
  deliveredAt: Date | null;
  subtotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  total: Prisma.Decimal;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  service: {
    id: number;
    nombre: string;
    precioBase: Prisma.Decimal | null;
    activo: boolean;
  } | null;
};
