import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireApiAuth } from "@/lib/api-auth";
import {
  CustomerRecordRelatedEntityNotFoundError,
} from "@/src/modules/customers/domain/customer-records.errors";
import { CustomerRecordsService } from "@/src/modules/customers/application/customer-records.service";
import {
  createCustomerNoteSchema,
  formatZodIssues,
  idParamSchema,
} from "@/src/modules/customers/presentation/customer-records.schemas";

const recordsService = new CustomerRecordsService();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireApiAuth(_request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const params = idParamSchema.parse(await context.params);
    const notes = await recordsService.listNotesByCustomerId(params.id);

    return NextResponse.json({ data: notes }, { status: 200 });
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

    console.error("GET /api/customers/[id]/notes failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const params = idParamSchema.parse(await context.params);
    const body = createCustomerNoteSchema.parse(await request.json());

    const note = await recordsService.createNote(params.id, body);

    return NextResponse.json({ data: note }, { status: 201 });
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

    if (error instanceof CustomerRecordRelatedEntityNotFoundError) {
      if (error.entity === "customer") {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
      }

      if (error.entity === "adminUser") {
        return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
      }
    }

    console.error("POST /api/customers/[id]/notes failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
