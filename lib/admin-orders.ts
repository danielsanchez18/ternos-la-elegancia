/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

function parseId(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseAdminCustomOrderId(value: string): number | null {
  return parseId(value);
}

function serializeOrder(order: any) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    discountTotal: Number(order.discountTotal),
    total: Number(order.total),
    items: order.items?.map((item: any) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      discountAmount: Number(item.discountAmount),
      subtotal: Number(item.subtotal),
      parts: item.parts?.map((part: any) => ({
        ...part,
        unitPrice: part.unitPrice ? Number(part.unitPrice) : null,
      })),
    })),
    payments: order.payments?.map((p: any) => ({
      ...p,
      amount: Number(p.amount),
    })),
    comprobantes: order.comprobantes?.map((c: any) => ({
      ...c,
      subtotal: c.subtotal ? Number(c.subtotal) : null,
      impuesto: c.impuesto ? Number(c.impuesto) : null,
      total: Number(c.total),
    })),
  };
}

async function getAdminOrderFormData(input: { onlyActiveFabrics: boolean }) {
  const [customers, fabrics] = await Promise.all([
    prisma.customer.findMany({
      select: { id: true, nombres: true, apellidos: true, dni: true },
      orderBy: { nombres: "asc" },
    }),
    prisma.fabric.findMany({
      where: input.onlyActiveFabrics ? { active: true } : undefined,
      select: { id: true, code: true, nombre: true, color: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return { customers, fabrics };
}

export async function getAdminCreateCustomOrderFormData() {
  return getAdminOrderFormData({ onlyActiveFabrics: true });
}

export async function getAdminEditCustomOrderFormData() {
  return getAdminOrderFormData({ onlyActiveFabrics: false });
}

export async function getAdminCustomOrdersListData() {
  const orders = await prisma.customOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { nombres: true, apellidos: true } },
      items: {
        include: {
          parts: true,
        },
      },
    },
  });

  return orders.map(serializeOrder);
}

export async function getAdminOrdersOverviewData() {
  const [
    totalCustom,
    pendingReserve,
    inProduction,
    readyToDeliver,
    totalSales,
    totalRentals,
    totalAlterations,
  ] = await Promise.all([
    prisma.customOrder.count(),
    prisma.customOrder.count({ where: { status: "PENDIENTE_RESERVA" } }),
    prisma.customOrder.count({
      where: { status: { in: ["EN_CONFECCION", "EN_PRUEBA"] } },
    }),
    prisma.customOrder.count({ where: { status: "LISTO" } }),
    prisma.saleOrder.count(),
    prisma.rentalOrder.count(),
    prisma.alterationOrder.count(),
  ]);

  const recentCustomOrders = await prisma.customOrder.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { nombres: true, apellidos: true } },
      items: {
        include: {
          parts: true,
        },
      },
    },
  });

  return {
    customOrders: {
      total: totalCustom,
      pending: pendingReserve,
      active: inProduction,
      ready: readyToDeliver,
      recent: recentCustomOrders.map(serializeOrder),
    },
    otherOrders: {
      sales: totalSales,
      rentals: totalRentals,
      alterations: totalAlterations,
    },
  };
}

export async function getAdminCustomOrderDetail(id: number) {
  const order = await prisma.customOrder.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          dni: true,
          email: true,
          celular: true,
        },
      },
      items: {
        include: {
          parts: {
            include: {
              product: true,
              selections: {
                orderBy: { definition: { sortOrder: "asc" } },
              },
            },
          },
        },
      },
      history: {
        orderBy: { changedAt: "desc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      comprobantes: {
        orderBy: { issuedAt: "desc" },
      },
    },
  });

  if (!order) return null;

  return serializeOrder(order);
}

function buildWorkshopMeasurementsMap(order: any): number[] {
  const profileIds = Array.from(
    new Set<number>(
      order.items
        .flatMap((item: any) => item.parts)
        .map((part: any) => part.measurementProfileId as number | null)
        .filter(
          (profileId: number | null): profileId is number =>
            typeof profileId === "number"
        )
    )
  );

  return profileIds;
}

function attachWorkshopMeasurementsToOrder(order: any, profiles: any[]) {
  order.items.forEach((item: any) => {
    item.parts.forEach((part: any) => {
      if (part.measurementProfileId && part.measurementProfileGarmentId) {
        const profile = profiles.find((profileItem) => profileItem.id === part.measurementProfileId);
        const garment = profile?.garments.find(
          (garmentItem: any) => garmentItem.id === part.measurementProfileGarmentId
        );

        if (garment) {
          part.measurements = garment.values.map((value: any) => ({
            label: value.field.label,
            value: value.valueNumber ? Number(value.valueNumber) : value.valueText,
            unit: value.field.unit,
          }));
        }
      }
    });
  });
}

export async function getAdminWorkshopSheetData(id: number) {
  const order = await prisma.customOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          parts: {
            include: {
              selections: {
                orderBy: { definition: { sortOrder: "asc" } },
              },
            },
          },
        },
      },
    },
  });

  if (!order) return null;

  const profileIds = buildWorkshopMeasurementsMap(order);

  const profiles = await prisma.measurementProfile.findMany({
    where: { id: { in: profileIds } },
    include: {
      garments: {
        include: {
          values: {
            include: {
              field: true,
            },
          },
        },
      },
    },
  });

  const serializedOrder = serializeOrder(order);
  attachWorkshopMeasurementsToOrder(serializedOrder, profiles);

  return serializedOrder;
}
