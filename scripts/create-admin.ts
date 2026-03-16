import { config as loadEnv } from "dotenv";
import { hashPassword as hashAuthPassword } from "better-auth/crypto";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

type ParsedArgs = {
  email?: string;
  password?: string;
  nombres?: string;
  apellidos?: string;
  displayName?: string;
  isActive: boolean;
  resetPassword: boolean;
  help: boolean;
};

function getArgValue(argv: string[], names: string[]): string | undefined {
  for (const name of names) {
    const index = argv.indexOf(`--${name}`);

    if (index !== -1) {
      return argv[index + 1];
    }
  }

  return undefined;
}

function hasFlag(argv: string[], names: string[]): boolean {
  return names.some((name) => argv.includes(`--${name}`));
}

function parseArgs(argv: string[]): ParsedArgs {
  return {
    email: getArgValue(argv, ["email"]),
    password: getArgValue(argv, ["password"]),
    nombres: getArgValue(argv, ["nombres", "first-name"]),
    apellidos: getArgValue(argv, ["apellidos", "last-name"]),
    displayName: getArgValue(argv, ["display-name", "name", "full-name"]),
    isActive: !hasFlag(argv, ["inactive"]),
    resetPassword: hasFlag(argv, ["reset-password"]),
    help: hasFlag(argv, ["help", "h"]),
  };
}

function printUsage() {
  console.log(`
Uso:
  npm run admin:create -- --email admin@empresa.com --password "tu-clave" --nombres "Leo" --apellidos "Aguinaga"

Opciones:
  --email           Correo del administrador
  --password        Contrasena del login con Better Auth
  --nombres         Nombres del perfil AdminUser
  --apellidos       Apellidos del perfil AdminUser (opcional)
  --display-name    Nombre visible en Better Auth; por defecto usa nombres + apellidos
  --inactive        Crea o actualiza el admin como inactivo
  --reset-password  Si el usuario ya existe, actualiza su password de login
  --help, -h        Muestra esta ayuda

Notas:
  - Si el usuario auth no existe, el script crea User + Account + AdminUser.
  - Si el usuario ya existe, lo promueve a admin y enlaza authUserId.
  - Si el usuario ya tenia password y no usas --reset-password, la conserva.
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  const email = args.email?.trim().toLowerCase();
  const password = args.password?.trim();
  const nombres = args.nombres?.trim();
  const apellidos = args.apellidos?.trim() || null;

  if (!email || !password || !nombres) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (password.length < 8) {
    console.error("La contrasena debe tener al menos 8 caracteres.");
    process.exitCode = 1;
    return;
  }

  const displayName =
    args.displayName?.trim() ||
    [nombres, apellidos].filter(Boolean).join(" ").trim();

  if (!displayName) {
    console.error("No se pudo determinar el nombre visible del usuario.");
    process.exitCode = 1;
    return;
  }

  const [{ prisma }, { hashDomainPassword }] = await Promise.all([
    import("../lib/prisma"),
    import("../lib/password-hash"),
  ]);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        adminProfile: true,
        customer: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    const domainPasswordHash = hashDomainPassword(password);
    const authPasswordHash = await hashAuthPassword(password);

    if (!existingUser) {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            name: displayName,
          },
        });

        await tx.account.create({
          data: {
            userId: user.id,
            providerId: "credential",
            accountId: user.id,
            password: authPasswordHash,
          },
        });

        const admin = await tx.adminUser.create({
          data: {
            authUserId: user.id,
            email,
            passwordHash: domainPasswordHash,
            nombres,
            apellidos,
            isActive: args.isActive,
          },
        });

        return { user, admin };
      });

      console.log("Administrador creado correctamente.");
      console.log(`User ID: ${result.user.id}`);
      console.log(`Admin ID: ${result.admin.id}`);
      console.log(`Email: ${email}`);
      console.log(`Activo: ${result.admin.isActive ? "si" : "no"}`);
      return;
    }

    const credentialAccount = existingUser.accounts.find(
      (account) => account.providerId === "credential"
    );

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: existingUser.id },
        data: {
          email,
          name: displayName,
        },
      });

      if (!credentialAccount) {
        await tx.account.create({
          data: {
            userId: existingUser.id,
            providerId: "credential",
            accountId: existingUser.id,
            password: authPasswordHash,
          },
        });
      } else if (args.resetPassword) {
        await tx.account.update({
          where: { id: credentialAccount.id },
          data: { password: authPasswordHash },
        });
      }

      const admin = existingUser.adminProfile
        ? await tx.adminUser.update({
            where: { id: existingUser.adminProfile.id },
            data: {
              authUserId: existingUser.id,
              email,
              passwordHash: domainPasswordHash,
              nombres,
              apellidos,
              isActive: args.isActive,
            },
          })
        : await tx.adminUser.create({
            data: {
              authUserId: existingUser.id,
              email,
              passwordHash: domainPasswordHash,
              nombres,
              apellidos,
              isActive: args.isActive,
            },
          });

      return { user, admin };
    });

    console.log("Usuario existente actualizado y enlazado como administrador.");
    console.log(`User ID: ${result.user.id}`);
    console.log(`Admin ID: ${result.admin.id}`);
    console.log(`Email: ${email}`);
    console.log(`Activo: ${result.admin.isActive ? "si" : "no"}`);

    if (existingUser.customer) {
      console.log(
        `Aviso: este User tambien esta vinculado a Customer #${existingUser.customer.id}.`
      );
    }

    if (credentialAccount && !args.resetPassword) {
      console.log(
        "Password de Better Auth conservado. Usa --reset-password si quieres reemplazarlo."
      );
    }
  } catch (error) {
    console.error("No se pudo crear o enlazar el administrador.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    const { prisma } = await import("../lib/prisma");
    await prisma.$disconnect();
  }
}

void main();
