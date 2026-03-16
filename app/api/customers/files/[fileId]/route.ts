import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { CustomerRecordsService } from "@/src/modules/customers/application/customer-records.service";
import { CustomerFileNotFoundError } from "@/src/modules/customers/domain/customer-records.errors";
import {
  fileIdParamSchema,
  formatZodIssues,
  updateCustomerFileSchema,
} from "@/src/modules/customers/presentation/customer-records.schemas";

const recordsService = new CustomerRecordsService();

type RouteContext = {
  params: Promise<{ fileId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const params = fileIdParamSchema.parse(await context.params);
    const body = updateCustomerFileSchema.parse(await request.json());

    const file = await recordsService.updateFile(params.fileId, body);

    return NextResponse.json({ data: file }, { status: 200 });
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

    if (error instanceof CustomerFileNotFoundError) {
      return NextResponse.json({ error: "Customer file not found" }, { status: 404 });
    }

    console.error("PATCH /api/customers/files/[fileId] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const params = fileIdParamSchema.parse(await context.params);

    await recordsService.deleteFile(params.fileId);

    return NextResponse.json({ data: { deleted: true } }, { status: 200 });
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

    if (error instanceof CustomerFileNotFoundError) {
      return NextResponse.json({ error: "Customer file not found" }, { status: 404 });
    }

    console.error("DELETE /api/customers/files/[fileId] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
