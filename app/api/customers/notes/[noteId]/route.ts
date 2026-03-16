import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { CustomerRecordsService } from "@/src/modules/customers/application/customer-records.service";
import {
  CustomerNoteNotFoundError,
  CustomerRecordRelatedEntityNotFoundError,
} from "@/src/modules/customers/domain/customer-records.errors";
import {
  formatZodIssues,
  noteIdParamSchema,
  updateCustomerNoteSchema,
} from "@/src/modules/customers/presentation/customer-records.schemas";

const recordsService = new CustomerRecordsService();

type RouteContext = {
  params: Promise<{ noteId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const params = noteIdParamSchema.parse(await context.params);
    const body = updateCustomerNoteSchema.parse(await request.json());

    const note = await recordsService.updateNote(params.noteId, body);

    return NextResponse.json({ data: note }, { status: 200 });
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

    if (error instanceof CustomerNoteNotFoundError) {
      return NextResponse.json({ error: "Customer note not found" }, { status: 404 });
    }

    if (
      error instanceof CustomerRecordRelatedEntityNotFoundError &&
      error.entity === "adminUser"
    ) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    console.error("PATCH /api/customers/notes/[noteId] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const params = noteIdParamSchema.parse(await context.params);

    await recordsService.deleteNote(params.noteId);

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

    if (error instanceof CustomerNoteNotFoundError) {
      return NextResponse.json({ error: "Customer note not found" }, { status: 404 });
    }

    console.error("DELETE /api/customers/notes/[noteId] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
