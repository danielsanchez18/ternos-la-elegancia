import { AppointmentStatus, Prisma, RentalOrderStatus } from "@prisma/client";

export type ReportsDateRange = {
  from: Date;
  to: Date;
};

export type SalesByPeriod = {
  range: ReportsDateRange;
  totalOrders: number;
  grossTotal: Prisma.Decimal;
  byModule: {
    sale: { orders: number; total: Prisma.Decimal };
    custom: { orders: number; total: Prisma.Decimal };
    rental: { orders: number; total: Prisma.Decimal };
    alteration: { orders: number; total: Prisma.Decimal };
  };
};

export type ActiveRentalsSnapshot = {
  totalActiveOrders: number;
  totalUnitsOut: number;
  byStatus: Array<{
    status: RentalOrderStatus;
    count: number;
  }>;
};

export type TopRentedProduct = {
  productId: number;
  productName: string;
  productSlug: string;
  timesRented: number;
};

export type RecurrentCustomer = {
  customerId: number;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string | null;
  totalOrders: number;
  byModule: {
    sale: number;
    custom: number;
    rental: number;
    alteration: number;
  };
};

export type MeasurementReservations = {
  range: ReportsDateRange;
  total: number;
  upcoming: number;
  byStatus: Array<{
    status: AppointmentStatus;
    count: number;
  }>;
};

export type LowStockVariant = {
  variantId: number;
  sku: string;
  stock: number;
  minStock: number;
  shortage: number;
  product: {
    id: number;
    nombre: string;
    slug: string;
  };
};

export type NewCustomerMeasurementAlert = {
  customerId: number;
  nombres: string;
  apellidos: string;
  email: string;
  createdAt: Date;
  hasMeasurementProfile: boolean;
  latestValidUntil: Date | null;
  reason: "NO_PROFILE" | "EXPIRED_PROFILE";
};

export type NewCustomersMeasurementRisk = {
  range: ReportsDateRange;
  totalNewCustomers: number;
  customersWithoutProfile: number;
  customersWithExpiredProfile: number;
  affectedCustomers: NewCustomerMeasurementAlert[];
};

export type MinimumReportsFilters = {
  from?: Date;
  to?: Date;
  topRentedLimit?: number;
  recurrentMinOrders?: number;
  stockLimit?: number;
};

export type MinimumReportsResult = {
  generatedAt: Date;
  salesByPeriod: SalesByPeriod;
  activeRentals: ActiveRentalsSnapshot;
  topRentedProducts: TopRentedProduct[];
  recurrentCustomers: RecurrentCustomer[];
  measurementReservations: MeasurementReservations;
  lowStock: LowStockVariant[];
  newCustomersMeasurementRisk: NewCustomersMeasurementRisk;
};
