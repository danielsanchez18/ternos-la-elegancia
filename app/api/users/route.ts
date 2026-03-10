import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createUserSchema, formatZodErrors } from "@/lib/validators/user";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = createUserSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodErrors(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const createdUser = await prisma.user.create({
      data: {
        email: parsedBody.data.email,
        name: parsedBody.data.name,
      },
    });

    return NextResponse.json(createdUser, { status: 201 });
  } catch (error: unknown) {
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
      { error: "Could not create user" },
      { status: 500 }
    );
  }
}
