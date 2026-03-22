import { prisma } from "@/lib/prisma";

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

  // Fetch unique measurement profiles involved
  const profileIds = Array.from(
    new Set(
      order.items
        .flatMap((item) => item.parts)
        .map((part) => part.measurementProfileId)
        .filter((id): id is number => id !== null)
    )
  );

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

  // Attach measurements to each part for easier rendering
  const serializedOrder = serializeOrder(order);
  
  serializedOrder.items.forEach((item: any) => {
    item.parts.forEach((part: any) => {
      if (part.measurementProfileId && part.measurementProfileGarmentId) {
        const profile = profiles.find((p) => p.id === part.measurementProfileId);
        const garment = profile?.garments.find((g) => g.id === part.measurementProfileGarmentId);
        if (garment) {
          part.measurements = garment.values.map((v) => ({
            label: v.field.label,
            value: v.valueNumber ? Number(v.valueNumber) : v.valueText,
            unit: v.field.unit,
          }));
        }
      }
    });
  });

  return serializedOrder;
}
