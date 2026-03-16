import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { CustomerConflictError } from "@/src/modules/customers/domain/customer.errors";
import { customerService } from "@/src/modules/customers/application/customer.service";
import { createCustomerSchema, formatZodIssues } from "@/src/modules/customers/presentation/customer.schemas";

export async function GET(request: Request) {
  const auth = await requireApiAuth(request, "admin");
  if (!auth.ok) {
    return auth.response;
  }

  const customers = await customerService.listCustomers();
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

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
