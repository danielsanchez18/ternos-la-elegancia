import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { PublicCustomer, UpdateCustomerInput } from "@/src/modules/customers/domain/customer.types";

export type CreateCustomerPersistenceInput = {
  nombres: string;
  apellidos: string;
  email: string;
  celular?: string;
  dni: string;
  passwordHash: string;
};

const publicCustomerSelect = {
  id: true,
  nombres: true,
  apellidos: true,
  email: true,
  celular: true,
  dni: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CustomerSelect;

export class CustomerRepository {
  async create(data: CreateCustomerPersistenceInput): Promise<PublicCustomer> {
    return prisma.customer.create({
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        celular: data.celular,
        dni: data.dni,
        passwordHash: data.passwordHash,
      },
      select: publicCustomerSelect,
    });
  }

  async findMany(): Promise<PublicCustomer[]> {
    return prisma.customer.findMany({
      select: publicCustomerSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: number): Promise<PublicCustomer | null> {
    return prisma.customer.findUnique({
      where: { id },
      select: publicCustomerSelect,
    });
  }

  async updateById(id: number, data: UpdateCustomerInput & { passwordHash?: string }): Promise<PublicCustomer> {
    return prisma.customer.update({
      where: { id },
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        celular: data.celular,
        dni: data.dni,
        isActive: data.isActive,
        passwordHash: data.passwordHash,
      },
      select: publicCustomerSelect,
    });
  }
}
