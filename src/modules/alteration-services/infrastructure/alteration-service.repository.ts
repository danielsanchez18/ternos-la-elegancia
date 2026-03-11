import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateAlterationServiceInput,
  ListAlterationServicesFilters,
  PublicAlterationService,
  UpdateAlterationServiceInput,
} from "@/src/modules/alteration-services/domain/alteration-service.types";

const publicAlterationServiceSelect = {
  id: true,
  nombre: true,
  precioBase: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AlterationServiceSelect;

export class AlterationServiceRepository {
  async list(filters: ListAlterationServicesFilters): Promise<PublicAlterationService[]> {
    return prisma.alterationService.findMany({
      where: {
        activo: filters.active,
      },
      orderBy: [{ activo: "desc" }, { nombre: "asc" }],
      select: publicAlterationServiceSelect,
    });
  }

  async findById(id: number): Promise<PublicAlterationService | null> {
    return prisma.alterationService.findUnique({
      where: { id },
      select: publicAlterationServiceSelect,
    });
  }

  async create(input: CreateAlterationServiceInput): Promise<PublicAlterationService> {
    return prisma.alterationService.create({
      data: {
        nombre: input.nombre,
        precioBase:
          input.precioBase !== undefined ? new Prisma.Decimal(input.precioBase) : undefined,
        activo: input.activo,
      },
      select: publicAlterationServiceSelect,
    });
  }

  async updateById(
    id: number,
    input: UpdateAlterationServiceInput
  ): Promise<PublicAlterationService> {
    return prisma.alterationService.update({
      where: { id },
      data: {
        nombre: input.nombre,
        precioBase:
          input.precioBase !== undefined
            ? input.precioBase === null
              ? null
              : new Prisma.Decimal(input.precioBase)
            : undefined,
        activo: input.activo,
      },
      select: publicAlterationServiceSelect,
    });
  }

  async deactivateById(id: number): Promise<PublicAlterationService> {
    return prisma.alterationService.update({
      where: { id },
      data: {
        activo: false,
      },
      select: publicAlterationServiceSelect,
    });
  }
}
