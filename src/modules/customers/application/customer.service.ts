import { Prisma } from "@prisma/client";

import { hashDomainPassword } from "@/lib/password-hash";
import { CustomerConflictError, CustomerNotFoundError } from "@/src/modules/customers/domain/customer.errors";
import { CreateCustomerInput, PublicCustomer, UpdateCustomerInput } from "@/src/modules/customers/domain/customer.types";
import { CustomerRepository } from "@/src/modules/customers/infrastructure/customer.repository";

export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async createCustomer(input: CreateCustomerInput): Promise<PublicCustomer> {
    try {
      return await this.customerRepository.create({
        nombres: input.nombres,
        apellidos: input.apellidos,
        email: input.email,
        celular: input.celular,
        dni: input.dni,
        passwordHash: hashDomainPassword(input.password),
      });
    } catch (error: unknown) {
      this.handlePersistenceError(error);
    }
  }

  async listCustomers(): Promise<PublicCustomer[]> {
    return this.customerRepository.findMany();
  }

  async getCustomerById(id: number): Promise<PublicCustomer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new CustomerNotFoundError();
    }

    return customer;
  }

  async updateCustomer(id: number, input: UpdateCustomerInput): Promise<PublicCustomer> {
    try {
      return await this.customerRepository.updateById(id, {
        ...input,
        passwordHash: input.password
          ? hashDomainPassword(input.password)
          : undefined,
      });
    } catch (error: unknown) {
      this.handlePersistenceError(error);
    }
  }

  async deactivateCustomer(id: number): Promise<PublicCustomer> {
    return this.updateCustomer(id, { isActive: false });
  }

  private handlePersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new CustomerNotFoundError();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      throw new CustomerConflictError(fields);
    }

    throw error;
  }
}

export const customerService = new CustomerService(new CustomerRepository());
