import { Prisma } from "@prisma/client";

export type ListAlterationServicesFilters = {
  active?: boolean;
};

export type CreateAlterationServiceInput = {
  nombre: string;
  precioBase?: number;
  activo?: boolean;
};

export type UpdateAlterationServiceInput = {
  nombre?: string;
  precioBase?: number | null;
  activo?: boolean;
};

export type PublicAlterationService = {
  id: string;
  nombre: string;
  precioBase: Prisma.Decimal | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
};
