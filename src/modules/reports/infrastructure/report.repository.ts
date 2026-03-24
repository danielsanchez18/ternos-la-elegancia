import { AppointmentStatus, Prisma, RentalOrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  ActiveRentalsSnapshot,
  LowStockVariant,
  MeasurementReservations,
  NewCustomersMeasurementRisk,
  RecurrentCustomer,
  ReportsDateRange,
  SalesByPeriod,
  TopRentedProduct,
} from "@/src/modules/reports/domain/report.types";

export class ReportRepository {
  async getSalesByPeriod(range: ReportsDateRange): Promise<SalesByPeriod> {
    const [sale, custom, rental, alteration] = await Promise.all([
      prisma.saleOrder.aggregate({
        where: {
          createdAt: { gte: range.from, lte: range.to },
          status: { not: "CANCELADO" },
        },
        _count: { _all: true },
        _sum: { total: true },
      }),
      prisma.customOrder.aggregate({
        where: {
          createdAt: { gte: range.from, lte: range.to },
          status: { not: "CANCELADO" },
        },
        _count: { _all: true },
        _sum: { total: true },
      }),
      prisma.rentalOrder.aggregate({
        where: {
          createdAt: { gte: range.from, lte: range.to },
          status: { not: "CANCELADO" },
        },
        _count: { _all: true },
        _sum: { total: true },
      }),
      prisma.alterationOrder.aggregate({
        where: {
          createdAt: { gte: range.from, lte: range.to },
          status: { not: "CANCELADO" },
        },
        _count: { _all: true },
        _sum: { total: true },
      }),
    ]);

    const saleTotal = sale._sum.total ?? new Prisma.Decimal(0);
    const customTotal = custom._sum.total ?? new Prisma.Decimal(0);
    const rentalTotal = rental._sum.total ?? new Prisma.Decimal(0);
    const alterationTotal = alteration._sum.total ?? new Prisma.Decimal(0);

    return {
      range,
      totalOrders:
        sale._count._all +
        custom._count._all +
        rental._count._all +
        alteration._count._all,
      grossTotal: saleTotal.add(customTotal).add(rentalTotal).add(alterationTotal),
      byModule: {
        sale: { orders: sale._count._all, total: saleTotal },
        custom: { orders: custom._count._all, total: customTotal },
        rental: { orders: rental._count._all, total: rentalTotal },
        alteration: { orders: alteration._count._all, total: alterationTotal },
      },
    };
  }

  async getActiveRentalsSnapshot(): Promise<ActiveRentalsSnapshot> {
    const activeStatuses: RentalOrderStatus[] = [
      "RESERVADO",
      "ENTREGADO",
      "ATRASADO",
    ];

    const [totalActiveOrders, totalUnitsOut, byStatusRows] = await Promise.all([
      prisma.rentalOrder.count({
        where: {
          status: { in: activeStatuses },
        },
      }),
      prisma.rentalOrderItem.count({
        where: {
          returnedAt: null,
          rentalOrder: {
            status: { in: activeStatuses },
          },
        },
      }),
      prisma.rentalOrder.groupBy({
        by: ["status"],
        where: {
          status: { in: activeStatuses },
        },
        _count: { _all: true },
      }),
    ]);

    return {
      totalActiveOrders,
      totalUnitsOut,
      byStatus: byStatusRows.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
    };
  }

  async getTopRentedProducts(limit: number): Promise<TopRentedProduct[]> {
    const grouped = await prisma.rentalOrderItem.groupBy({
      by: ["productId"],
      where: {
        productId: { not: null },
        rentalOrder: {
          status: { not: "CANCELADO" },
        },
      },
      _count: { _all: true },
      orderBy: {
        _count: {
          productId: "desc",
        },
      },
      take: limit,
    });

    const productIds = grouped
      .map((row) => row.productId)
      .filter((value): value is string => value !== null);

    if (productIds.length === 0) {
      return [];
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        nombre: true,
        slug: true,
      },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    return grouped
      .map((row) => {
        if (row.productId === null) {
          return null;
        }

        const product = productMap.get(row.productId);
        if (!product) {
          return null;
        }

        return {
          productId: row.productId,
          productName: product.nombre,
          productSlug: product.slug,
          timesRented: row._count._all,
        };
      })
      .filter((item): item is TopRentedProduct => item !== null);
  }

  async getRecurrentCustomers(minOrders: number): Promise<RecurrentCustomer[]> {
    const [saleRows, customRows, rentalRows, alterationRows] = await Promise.all([
      prisma.saleOrder.groupBy({
        by: ["customerId"],
        where: { status: { not: "CANCELADO" } },
        _count: { _all: true },
      }),
      prisma.customOrder.groupBy({
        by: ["customerId"],
        where: { status: { not: "CANCELADO" } },
        _count: { _all: true },
      }),
      prisma.rentalOrder.groupBy({
        by: ["customerId"],
        where: { status: { not: "CANCELADO" } },
        _count: { _all: true },
      }),
      prisma.alterationOrder.groupBy({
        by: ["customerId"],
        where: { status: { not: "CANCELADO" } },
        _count: { _all: true },
      }),
    ]);

    const stats = new Map<
      string,
      { sale: number; custom: number; rental: number; alteration: number }
    >();

    const ensure = (customerId: string) => {
      if (!stats.has(customerId)) {
        stats.set(customerId, { sale: 0, custom: 0, rental: 0, alteration: 0 });
      }

      return stats.get(customerId)!;
    };

    for (const row of saleRows) {
      ensure(row.customerId).sale = row._count._all;
    }

    for (const row of customRows) {
      ensure(row.customerId).custom = row._count._all;
    }

    for (const row of rentalRows) {
      ensure(row.customerId).rental = row._count._all;
    }

    for (const row of alterationRows) {
      ensure(row.customerId).alteration = row._count._all;
    }

    const recurrentIds = Array.from(stats.entries())
      .filter(([, value]) => value.sale + value.custom + value.rental + value.alteration >= minOrders)
      .map(([customerId]) => customerId);

    if (recurrentIds.length === 0) {
      return [];
    }

    const customers = await prisma.customer.findMany({
      where: {
        id: { in: recurrentIds },
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        celular: true,
      },
    });

    return customers
      .map((customer) => {
        const value = stats.get(customer.id);
        if (!value) {
          return null;
        }

        return {
          customerId: customer.id,
          nombres: customer.nombres,
          apellidos: customer.apellidos,
          email: customer.email,
          celular: customer.celular,
          totalOrders: value.sale + value.custom + value.rental + value.alteration,
          byModule: value,
        };
      })
      .filter((item): item is RecurrentCustomer => item !== null)
      .sort((a, b) => b.totalOrders - a.totalOrders);
  }

  async getMeasurementReservations(range: ReportsDateRange): Promise<MeasurementReservations> {
    const [total, upcoming, byStatusRows] = await Promise.all([
      prisma.appointment.count({
        where: {
          type: "TOMA_MEDIDAS",
          scheduledAt: { gte: range.from, lte: range.to },
        },
      }),
      prisma.appointment.count({
        where: {
          type: "TOMA_MEDIDAS",
          status: { in: ["PENDIENTE", "CONFIRMADA", "REPROGRAMADA"] },
          scheduledAt: { gte: new Date() },
        },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: {
          type: "TOMA_MEDIDAS",
          scheduledAt: { gte: range.from, lte: range.to },
        },
        _count: { _all: true },
      }),
    ]);

    return {
      range,
      total,
      upcoming,
      byStatus: byStatusRows.map((row) => ({
        status: row.status as AppointmentStatus,
        count: row._count._all,
      })),
    };
  }

  async getLowStockVariants(limit: number): Promise<LowStockVariant[]> {
    const rows = await prisma.productVariant.findMany({
      where: {
        active: true,
        minStock: { gt: 0 },
      },
      orderBy: [{ stock: "asc" }, { minStock: "desc" }, { id: "asc" }],
      select: {
        id: true,
        sku: true,
        stock: true,
        minStock: true,
        product: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
      },
    });

    return rows
      .filter((row) => row.stock <= row.minStock)
      .slice(0, limit)
      .map((row) => ({
        variantId: row.id,
        sku: row.sku,
        stock: row.stock,
        minStock: row.minStock,
        shortage: Math.max(0, row.minStock - row.stock),
        product: row.product,
      }));
  }

  async getNewCustomersMeasurementRisk(
    range: ReportsDateRange,
    now: Date
  ): Promise<NewCustomersMeasurementRisk> {
    const customers = await prisma.customer.findMany({
      where: {
        createdAt: { gte: range.from, lte: range.to },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        createdAt: true,
        measurementProfiles: {
          where: {
            isActive: true,
          },
          orderBy: { validUntil: "desc" },
          take: 1,
          select: {
            validUntil: true,
          },
        },
      },
    });

    const affectedCustomers = customers
      .map((customer) => {
        const latest = customer.measurementProfiles[0];

        if (!latest) {
          return {
            customerId: customer.id,
            nombres: customer.nombres,
            apellidos: customer.apellidos,
            email: customer.email,
            createdAt: customer.createdAt,
            hasMeasurementProfile: false,
            latestValidUntil: null,
            reason: "NO_PROFILE" as const,
          };
        }

        if (latest.validUntil < now) {
          return {
            customerId: customer.id,
            nombres: customer.nombres,
            apellidos: customer.apellidos,
            email: customer.email,
            createdAt: customer.createdAt,
            hasMeasurementProfile: true,
            latestValidUntil: latest.validUntil,
            reason: "EXPIRED_PROFILE" as const,
          };
        }

        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      range,
      totalNewCustomers: customers.length,
      customersWithoutProfile: affectedCustomers.filter(
        (customer) => customer.reason === "NO_PROFILE"
      ).length,
      customersWithExpiredProfile: affectedCustomers.filter(
        (customer) => customer.reason === "EXPIRED_PROFILE"
      ).length,
      affectedCustomers,
    };
  }
}
