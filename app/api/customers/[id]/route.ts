import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { customerService } from "@/src/modules/customers/application/customer.service";
import { CustomerConflictError, CustomerNotFoundError } from "@/src/modules/customers/domain/customer.errors";
import {
  customerIdParamSchema,
  formatZodIssues,
  updateCustomerSchema,
} from "@/src/modules/customers/presentation/customer.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = customerIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const customer = await customerService.getCustomerById(parsedParams.data.id);
    return NextResponse.json(customer);
  } catch (error: unknown) {
    if (error instanceof CustomerNotFoundError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not get customer" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = customerIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateCustomerSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const customer = await customerService.updateCustomer(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(customer);
  } catch (error: unknown) {
    if (error instanceof CustomerNotFoundError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

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
      { error: "Could not update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = customerIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const customer = await customerService.deactivateCustomer(parsedParams.data.id);
    return NextResponse.json(customer);
  } catch (error: unknown) {
    if (error instanceof CustomerNotFoundError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not deactivate customer" },
      { status: 500 }
    );
  }
}
