import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { CustomerRecordsService } from "@/src/modules/customers/application/customer-records.service";
import { CustomerRecordRelatedEntityNotFoundError } from "@/src/modules/customers/domain/customer-records.errors";
import {
  createCustomerFileSchema,
  formatZodIssues,
  idParamSchema,
} from "@/src/modules/customers/presentation/customer-records.schemas";

const recordsService = new CustomerRecordsService();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const params = idParamSchema.parse(await context.params);
    const files = await recordsService.listFilesByCustomerId(params.id);

    return NextResponse.json({ data: files }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: formatZodIssues(error.issues),
        },
        { status: 400 }
      );
    }

    if (
      error instanceof CustomerRecordRelatedEntityNotFoundError &&
      error.entity === "customer"
    ) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    console.error("GET /api/customers/[id]/files failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const params = idParamSchema.parse(await context.params);
    const body = createCustomerFileSchema.parse(await request.json());

    const file = await recordsService.createFile(params.id, body);

    return NextResponse.json({ data: file }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: formatZodIssues(error.issues),
        },
        { status: 400 }
      );
    }

    if (
      error instanceof CustomerRecordRelatedEntityNotFoundError &&
      error.entity === "customer"
    ) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    console.error("POST /api/customers/[id]/files failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
