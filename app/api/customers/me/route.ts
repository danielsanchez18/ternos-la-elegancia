import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireApiAuth as getApiAuth } from "@/lib/api-auth";
import { auth as betterAuthInstance } from "@/lib/auth"; 
import { customerService } from "@/src/modules/customers/application/customer.service";
import { CustomerNotFoundError } from "@/src/modules/customers/domain/customer.errors";
import {
  formatZodIssues,
  updateMeSchema,
} from "@/src/modules/customers/presentation/customer.schemas";
import { verifyDomainPassword } from "@/lib/password-hash";

export async function GET(request: Request) {
  try {
    const sessionAuth = await getApiAuth(request, "authenticated");
    if (!sessionAuth.ok) {
      return sessionAuth.response;
    }

    const customerId = sessionAuth.context.customerId;
    if (!customerId) {
      return NextResponse.json(
        { error: "El usuario autenticado no tiene un perfil de cliente asociado." },
        { status: 403 }
      );
    }

    const customer = await customerService.getCustomerById(customerId);
    return NextResponse.json(customer);
  } catch (error: unknown) {
    if (error instanceof CustomerNotFoundError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not get customer" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionAuth = await getApiAuth(request, "authenticated");
    if (!sessionAuth.ok) {
      return sessionAuth.response;
    }

    const customerId = sessionAuth.context.customerId;
    if (!customerId) {
      return NextResponse.json(
        { error: "El usuario autenticado no tiene un perfil de cliente asociado." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsedBody = updateMeSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, ...otherData } = parsedBody.data;

    // Verificar si se intenta cambiar la contraseña
    let finalUpdateData = { ...otherData };

    if (newPassword && currentPassword) {
      // Necesitamos el passwordHash que no se publica por defecto
      const customerRecord = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customerRecord) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
      }

      // Verificamos contraseña antigua usando la de la tabla Customer (como respaldo local)
      const isPasswordValid = verifyDomainPassword(currentPassword, customerRecord.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "La contraseña actual es incorrecta." },
          { status: 403 }
        );
      }

      // Sincronizar contraseña con Better Auth (si el usuario está vinculado)
      if (customerRecord.authUserId) {
        try {
          // Cambiar contraseña usando la sub-API de auth
          await betterAuthInstance.api.changePassword({
            body: {
              newPassword: newPassword,
              currentPassword: currentPassword,
              revokeOtherSessions: false,
            },
            headers: request.headers,
          });
        } catch (e) {
          console.error("No se pudo sincronizar la contraseña con Better Auth", e);
          return NextResponse.json(
            { error: "Ocurrió un error actualizado sus credenciales de Better Auth." },
            { status: 500 }
          );
        }
      }

      // Add to Customer DB payload
      (finalUpdateData as any).password = newPassword;
    }

    const updatedCustomer = await customerService.updateCustomer(
      customerId,
      finalUpdateData
    );

    return NextResponse.json(updatedCustomer);
  } catch (error: unknown) {
    console.error("Error en PATCH /api/customers/me", error);
    if (error instanceof CustomerNotFoundError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not update customer" },
      { status: 500 }
    );
  }
}
