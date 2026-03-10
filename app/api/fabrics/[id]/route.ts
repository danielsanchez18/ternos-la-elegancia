import { NextResponse } from "next/server";

import { fabricService } from "@/src/modules/fabrics/application/fabric.service";
import {
  FabricCodeConflictError,
  FabricNotFoundError,
} from "@/src/modules/fabrics/domain/fabric.errors";
import {
  fabricIdParamSchema,
  formatZodIssues,
  updateFabricSchema,
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

    const fabric = await fabricService.getFabricById(parsedParams.data.id);
    return NextResponse.json(fabric);
  } catch (error: unknown) {
    if (error instanceof FabricNotFoundError) {
      return NextResponse.json({ error: "Fabric not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not get fabric" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = fabricIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateFabricSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const fabric = await fabricService.updateFabric(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(fabric);
  } catch (error: unknown) {
    if (error instanceof FabricNotFoundError) {
      return NextResponse.json({ error: "Fabric not found" }, { status: 404 });
    }

    if (error instanceof FabricCodeConflictError) {
      return NextResponse.json(
        { error: "Fabric code already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Could not update fabric" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = fabricIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const fabric = await fabricService.deactivateFabric(parsedParams.data.id);
    return NextResponse.json(fabric);
  } catch (error: unknown) {
    if (error instanceof FabricNotFoundError) {
      return NextResponse.json({ error: "Fabric not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not deactivate fabric" },
      { status: 500 }
    );
  }
}
