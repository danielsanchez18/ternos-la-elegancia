import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAuth } from "@/lib/api-auth";
import { hashDomainPassword } from "@/lib/password-hash";
import { prisma } from "@/lib/prisma";

const bootstrapCustomerSchema = z.object({
  nombres: z.string().trim().min(1).max(120),
  apellidos: z.string().trim().min(1).max(120),
  dni: z.string().trim().min(8).max(20),
  celular: z.string().trim().min(6).max(20).optional(),
  password: z.string().min(8).max(72),
});

function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export async function POST(request: Request) {
  const auth = await requireApiAuth(request, "authenticated");
  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json();
  const parsed = bootstrapCustomerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        issues: formatZodIssues(parsed.error),
      },
      { status: 400 }
    );
  }

  const authUser = await prisma.user.findUnique({
    where: { id: auth.context.userId },
    select: {
      id: true,
      email: true,
      customer: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (authUser.customer) {
    return NextResponse.json({
      ok: true,
      alreadyLinked: true,
      customerId: authUser.customer.id,
    });
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        authUserId: authUser.id,
        nombres: parsed.data.nombres,
        apellidos: parsed.data.apellidos,
        email: authUser.email,
        celular: parsed.data.celular,
        dni: parsed.data.dni,
        passwordHash: hashDomainPassword(parsed.data.password),
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      ok: true,
      alreadyLinked: false,
      customerId: customer.id,
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];

      return NextResponse.json(
        {
          error: "Customer already exists",
          fields,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Could not bootstrap customer" },
      { status: 500 }
    );
  }
}
