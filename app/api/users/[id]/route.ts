import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import {
  formatZodErrors,
  updateUserSchema,
  userIdParamSchema,
} from "@/lib/validators/user";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  const auth = await requireApiAuth(_, "admin");
  if (!auth.ok) {
    return auth.response;
  }

  const parsedParams = userIdParamSchema.safeParse(await params);

  if (!parsedParams.success) {
    return NextResponse.json(
      {
        error: "Invalid route params",
        issues: formatZodErrors(parsedParams.error),
      },
      { status: 400 }
    );
  }

  const { id } = parsedParams.data;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = userIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodErrors(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const { id } = parsedParams.data;
    const body = await request.json();
    const parsedBody = updateUserSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodErrors(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        email: parsedBody.data.email,
        name: parsedBody.data.name,
      },
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Could not update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const auth = await requireApiAuth(_, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = userIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodErrors(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const { id } = parsedParams.data;

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not delete user" },
      { status: 500 }
    );
  }
}
