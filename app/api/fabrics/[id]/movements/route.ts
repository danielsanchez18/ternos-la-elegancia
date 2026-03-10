import { NextResponse } from "next/server";

import { fabricService } from "@/src/modules/fabrics/application/fabric.service";
import {
  FabricInvalidMovementError,
  FabricNotFoundError,
} from "@/src/modules/fabrics/domain/fabric.errors";
import {
  createFabricMovementSchema,
  fabricIdParamSchema,
  formatZodIssues,
} from "@/src/modules/fabrics/presentation/fabric.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = fabricIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const movements = await fabricService.listFabricMovements(parsedParams.data.id);
    return NextResponse.json(movements);
  } catch (error: unknown) {
    if (error instanceof FabricNotFoundError) {
      return NextResponse.json({ error: "Fabric not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not get fabric movements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = fabricIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = createFabricMovementSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const result = await fabricService.createFabricMovement(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof FabricNotFoundError) {
      return NextResponse.json({ error: "Fabric not found" }, { status: 404 });
    }

    if (error instanceof FabricInvalidMovementError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create fabric movement" },
      { status: 500 }
    );
  }
}
