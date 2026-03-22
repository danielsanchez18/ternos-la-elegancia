import { prisma } from "@/lib/prisma";

export async function getAdminFabricsListData() {
  const fabrics = await prisma.fabric.findMany({
    orderBy: {
      nombre: "asc",
    },
    include: {
      _count: {
        select: {
          movements: true,
          customParts: true,
        },
      },
    },
  });

  return fabrics;
}

export async function getAdminFabricsOverviewData() {
  const [totalCount, activeCount, lowStockCount, outOfStockCount] = await Promise.all([
    prisma.fabric.count(),
    prisma.fabric.count({
      where: { active: true },
    }),
    prisma.fabric.count({
      where: {
        active: true,
        metersInStock: { gt: 0 },
        // Compare dynamically if minMeters is greater than metersInStock
        // Prisma doesn't support comparing two columns directly in count cleanly 
        // without raw query, so we'll fetch those where stock < 10 for overview simplicity,
        // or just fetch all active and filter in memory if we have few fabrics.
      },
    }),
    prisma.fabric.count({
      where: {
        active: true,
        metersInStock: { lte: 0 },
      },
    }),
  ]);

  // Refine lowStockCount with in-memory check for accuracy on minMeters
  const allActiveFabrics = await prisma.fabric.findMany({
    where: { active: true, metersInStock: { gt: 0 } },
    select: { metersInStock: true, minMeters: true },
  });

  const refinedLowStockCount = allActiveFabrics.filter(
    (f: { metersInStock: any; minMeters: any }) => Number(f.metersInStock) <= Number(f.minMeters)
  ).length;

  // Recent movements
  const recentMovements = await prisma.fabricMovement.findMany({
    take: 5,
    orderBy: { happenedAt: "desc" },
    include: {
      fabric: {
        select: { code: true, nombre: true },
      },
    },
  });

  return {
    totalFabrics: totalCount,
    activeFabrics: activeCount,
    lowStockFabrics: refinedLowStockCount,
    outOfStockFabrics: outOfStockCount,
    recentMovements,
  };
}

export async function getAdminFabricMovementsData(fabricId: number) {
  return await prisma.fabricMovement.findMany({
    where: { fabricId },
    orderBy: { happenedAt: "desc" },
  });
}
