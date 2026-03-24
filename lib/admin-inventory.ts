import { prisma } from "@/lib/prisma";

async function fetchFabricsForList() {
  return prisma.fabric.findMany({
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
}

type FabricListRow = Awaited<ReturnType<typeof fetchFabricsForList>>[number];

function serializeFabricForList(fabric: FabricListRow) {
  return {
    ...fabric,
    metersInStock: Number(fabric.metersInStock),
    minMeters: Number(fabric.minMeters),
    costPerMeter: fabric.costPerMeter === null ? null : Number(fabric.costPerMeter),
    pricePerMeter: fabric.pricePerMeter === null ? null : Number(fabric.pricePerMeter),
    createdAt: fabric.createdAt.toISOString(),
    updatedAt: fabric.updatedAt.toISOString(),
  };
}

async function fetchOverviewCounts() {
  const [totalFabrics, activeFabrics, outOfStockFabrics] = await Promise.all([
    prisma.fabric.count(),
    prisma.fabric.count({ where: { active: true } }),
    prisma.fabric.count({
      where: {
        active: true,
        metersInStock: { lte: 0 },
      },
    }),
  ]);

  return {
    totalFabrics,
    activeFabrics,
    outOfStockFabrics,
  };
}

async function fetchLowStockCandidates() {
  return prisma.fabric.findMany({
    where: { active: true, metersInStock: { gt: 0 } },
    select: { metersInStock: true, minMeters: true },
  });
}

function countLowStock(fabrics: Array<{ metersInStock: unknown; minMeters: unknown }>) {
  return fabrics.filter((fabric) => Number(fabric.metersInStock) <= Number(fabric.minMeters))
    .length;
}

async function fetchRecentMovements() {
  return prisma.fabricMovement.findMany({
    take: 5,
    orderBy: { happenedAt: "desc" },
    include: {
      fabric: {
        select: { code: true, nombre: true },
      },
    },
  });
}

export async function getAdminFabricsListData() {
  const fabrics = await fetchFabricsForList();
  return fabrics.map(serializeFabricForList);
}

export async function getAdminFabricsOverviewData() {
  const [counts, lowStockCandidates, recentMovements] = await Promise.all([
    fetchOverviewCounts(),
    fetchLowStockCandidates(),
    fetchRecentMovements(),
  ]);

  return {
    totalFabrics: counts.totalFabrics,
    activeFabrics: counts.activeFabrics,
    lowStockFabrics: countLowStock(lowStockCandidates),
    outOfStockFabrics: counts.outOfStockFabrics,
    recentMovements,
  };
}

export async function getAdminFabricMovementsData(fabricId: string) {
  return prisma.fabricMovement.findMany({
    where: { fabricId },
    orderBy: { happenedAt: "desc" },
  });
}
