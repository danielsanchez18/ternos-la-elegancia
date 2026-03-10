import { NextResponse } from "next/server";

import { CustomerConflictError } from "@/src/modules/customers/domain/customer.errors";
import { customerService } from "@/src/modules/customers/application/customer.service";
import { createCustomerSchema, formatZodIssues } from "@/src/modules/customers/presentation/customer.schemas";

export async function GET() {
  const customers = await customerService.listCustomers();
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsed.error),
        },
        { status: 400 }
      );
    }

    const customer = await customerService.createCustomer(parsed.data);
    return NextResponse.json(customer, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof CustomerConflictError) {
      return NextResponse.json(
        {
          error: "Customer already exists",
          fields: error.fields,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Could not create customer" },
      { status: 500 }
    );
  }
}
