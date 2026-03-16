import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { fabricService } from "@/src/modules/fabrics/application/fabric.service";
import { FabricCodeConflictError } from "@/src/modules/fabrics/domain/fabric.errors";
import {
  createFabricSchema,
  formatZodIssues,
} from "@/src/modules/fabrics/presentation/fabric.schemas";

export async function GET(request: Request) {
  const auth = await requireApiAuth(request, "admin");
  if (!auth.ok) {
    return auth.response;
  }

  const fabrics = await fabricService.listFabrics();
  return NextResponse.json(fabrics);
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const parsedBody = createFabricSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const fabric = await fabricService.createFabric(parsedBody.data);
    return NextResponse.json(fabric, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof FabricCodeConflictError) {
      return NextResponse.json(
        { error: "Fabric code already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Could not create fabric" },
      { status: 500 }
    );
  }
}
