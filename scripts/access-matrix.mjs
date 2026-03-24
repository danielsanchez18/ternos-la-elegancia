import { config as loadEnv } from "dotenv";
import { hashPassword as hashAuthPassword } from "better-auth/crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes, scryptSync } from "node:crypto";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const SSL_MODES_REQUIRING_COMPAT = new Set(["prefer", "require", "verify-ca"]);

function resolvePrismaConnectionString(rawUrl) {
  if (!rawUrl) {
    return "";
  }

  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  const sslmode = parsed.searchParams.get("sslmode")?.toLowerCase();

  if (!sslmode || !SSL_MODES_REQUIRING_COMPAT.has(sslmode)) {
    return parsed.toString();
  }

  if (!parsed.searchParams.has("uselibpqcompat")) {
    parsed.searchParams.set("uselibpqcompat", "true");
  }

  return parsed.toString();
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: resolvePrismaConnectionString(process.env.DATABASE_URL),
  }),
  log: process.env.PRISMA_LOG_QUERIES === "true" ? ["query", "warn"] : ["warn"],
});

const BASE_URL = (process.env.ACCESS_MATRIX_BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);

const ADMIN_EMAIL = (process.env.ACCESS_MATRIX_ADMIN_EMAIL ?? "access.admin@laelegancia.test")
  .trim()
  .toLowerCase();
const ADMIN_PASSWORD = (process.env.ACCESS_MATRIX_ADMIN_PASSWORD ?? "Admin12345!").trim();
const CUSTOMER_EMAIL = (
  process.env.ACCESS_MATRIX_CUSTOMER_EMAIL ?? "access.customer@laelegancia.test"
)
  .trim()
  .toLowerCase();
const CUSTOMER_PASSWORD = (
  process.env.ACCESS_MATRIX_CUSTOMER_PASSWORD ?? "Customer12345!"
).trim();
const ADMIN_COOKIE_OVERRIDE = process.env.ACCESS_MATRIX_ADMIN_COOKIE?.trim() || null;
const CUSTOMER_COOKIE_OVERRIDE = process.env.ACCESS_MATRIX_CUSTOMER_COOKIE?.trim() || null;
const ALLOW_PARTIAL = process.env.ACCESS_MATRIX_ALLOW_PARTIAL === "true";

const ACCESS_CASES = [
  { id: "public-products", method: "GET", path: "/api/products", level: "public" },
  { id: "public-session-access", method: "GET", path: "/api/session-access", level: "public" },
  {
    id: "authenticated-available-coupons",
    method: "GET",
    path: "/api/orders/sale/1/available-coupons",
    level: "authenticated",
  },
  {
    id: "authenticated-izipay-token",
    method: "POST",
    path: "/api/payments/izipay/session-token",
    level: "authenticated",
    body: {},
  },
  { id: "admin-customers", method: "GET", path: "/api/customers", level: "admin" },
  { id: "admin-users", method: "GET", path: "/api/users", level: "admin" },
];

function hashDomainPassword(plainTextPassword) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plainTextPassword, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function deriveDniFromEmail(email) {
  let hash = 0;

  for (const char of email) {
    hash = (hash * 31 + char.charCodeAt(0)) % 100_000_000;
  }

  return hash.toString().padStart(8, "0");
}

async function waitForServer(maxAttempts = 20) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${BASE_URL}/api/session-access`, {
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        return;
      }
    } catch {
      // continue
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(
    `No se pudo conectar al servidor en ${BASE_URL}. Inicia la app (npm run start o npm run dev) y vuelve a ejecutar.`
  );
}

async function ensureAdminUser() {
  const existingUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    include: {
      accounts: true,
      adminProfile: true,
    },
  });

  const authPasswordHash = await hashAuthPassword(ADMIN_PASSWORD);
  const domainPasswordHash = hashDomainPassword(ADMIN_PASSWORD);

  if (!existingUser) {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: "Access Matrix Admin",
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

      await tx.adminUser.create({
        data: {
          authUserId: user.id,
          email: ADMIN_EMAIL,
          passwordHash: domainPasswordHash,
          nombres: "Access",
          apellidos: "Admin",
          isActive: true,
        },
      });
    });

    return;
  }

  const credentialAccount = existingUser.accounts.find(
    (account) => account.providerId === "credential"
  );

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: existingUser.id },
      data: { name: "Access Matrix Admin", email: ADMIN_EMAIL },
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
    } else {
      await tx.account.update({
        where: { id: credentialAccount.id },
        data: { password: authPasswordHash },
      });
    }

    if (!existingUser.adminProfile) {
      await tx.adminUser.create({
        data: {
          authUserId: existingUser.id,
          email: ADMIN_EMAIL,
          passwordHash: domainPasswordHash,
          nombres: "Access",
          apellidos: "Admin",
          isActive: true,
        },
      });
    } else {
      await tx.adminUser.update({
        where: { id: existingUser.adminProfile.id },
        data: {
          authUserId: existingUser.id,
          email: ADMIN_EMAIL,
          passwordHash: domainPasswordHash,
          isActive: true,
        },
      });
    }
  });
}

async function ensureCustomerUser() {
  const existingUser = await prisma.user.findUnique({
    where: { email: CUSTOMER_EMAIL },
    include: {
      accounts: true,
      customer: true,
    },
  });

  const authPasswordHash = await hashAuthPassword(CUSTOMER_PASSWORD);
  const domainPasswordHash = hashDomainPassword(CUSTOMER_PASSWORD);
  const derivedDni = deriveDniFromEmail(CUSTOMER_EMAIL);

  const customerByDni = await prisma.customer.findUnique({ where: { dni: derivedDni } });
  const chosenDni =
    !customerByDni || customerByDni.email === CUSTOMER_EMAIL
      ? derivedDni
      : `${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;

  if (!existingUser) {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: CUSTOMER_EMAIL,
          name: "Access Matrix Customer",
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

      await tx.customer.create({
        data: {
          authUserId: user.id,
          nombres: "Access",
          apellidos: "Customer",
          email: CUSTOMER_EMAIL,
          celular: null,
          dni: chosenDni,
          passwordHash: domainPasswordHash,
          isActive: true,
        },
      });
    });

    return;
  }

  const credentialAccount = existingUser.accounts.find(
    (account) => account.providerId === "credential"
  );

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: existingUser.id },
      data: { name: "Access Matrix Customer", email: CUSTOMER_EMAIL },
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
    } else {
      await tx.account.update({
        where: { id: credentialAccount.id },
        data: { password: authPasswordHash },
      });
    }

    if (!existingUser.customer) {
      await tx.customer.create({
        data: {
          authUserId: existingUser.id,
          nombres: "Access",
          apellidos: "Customer",
          email: CUSTOMER_EMAIL,
          celular: null,
          dni: chosenDni,
          passwordHash: domainPasswordHash,
          isActive: true,
        },
      });
    } else {
      await tx.customer.update({
        where: { id: existingUser.customer.id },
        data: {
          authUserId: existingUser.id,
          nombres: "Access",
          apellidos: "Customer",
          email: CUSTOMER_EMAIL,
          passwordHash: domainPasswordHash,
          isActive: true,
        },
      });
    }
  });
}

function buildCookieHeaderFromSetCookie(setCookieHeaders) {
  return setCookieHeaders.map((cookie) => cookie.split(";")[0]).join("; ");
}

async function signInAndGetCookie(email, password) {
  const response = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: BASE_URL,
    },
    body: JSON.stringify({
      email,
      password,
      rememberMe: false,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(
      `No se pudo iniciar sesión para ${email}. Status ${response.status}. Respuesta: ${payload}`
    );
  }

  const setCookie =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : (() => {
          const single = response.headers.get("set-cookie");
          return single ? [single] : [];
        })();

  if (setCookie.length === 0) {
    throw new Error(`No se recibieron cookies de sesión para ${email}.`);
  }

  return buildCookieHeaderFromSetCookie(setCookie);
}

function expectedFor(level, role) {
  if (level === "public") {
    return "status != 401/403";
  }

  if (level === "authenticated") {
    return role === "public" ? "status == 401" : "status != 401";
  }

  if (level === "customer") {
    if (role === "public") {
      return "status == 401";
    }

    if (role === "customer") {
      return "status != 401/403";
    }

    return "status != 401";
  }

  if (role === "public") {
    return "status == 401";
  }

  if (role === "customer") {
    return "status == 403";
  }

  return "status != 401/403";
}

function isPass(level, role, status) {
  if (level === "public") {
    return status !== 401 && status !== 403;
  }

  if (level === "authenticated") {
    return role === "public" ? status === 401 : status !== 401;
  }

  if (level === "customer") {
    if (role === "public") {
      return status === 401;
    }

    if (role === "customer") {
      return status !== 401 && status !== 403;
    }

    return status !== 401;
  }

  if (role === "public") {
    return status === 401;
  }

  if (role === "customer") {
    return status === 403;
  }

  return status !== 401 && status !== 403;
}

async function runCase(testCase, role, cookieHeader) {
  const headers = {};

  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }

  if (testCase.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${testCase.path}`, {
    method: testCase.method,
    headers,
    body: testCase.body === undefined ? undefined : JSON.stringify(testCase.body),
    cache: "no-store",
    redirect: "manual",
  });

  const expected = expectedFor(testCase.level, role);
  const pass = isPass(testCase.level, role, response.status);

  return {
    caseId: testCase.id,
    method: testCase.method,
    path: testCase.path,
    level: testCase.level,
    role,
    status: response.status,
    pass,
    expected,
  };
}

function printResults(results) {
  console.log("");
  console.log("Matriz de acceso E2E");
  console.log("role | method | path | required | status | expected | pass");
  console.log("--- | --- | --- | --- | --- | --- | ---");

  for (const result of results) {
    console.log(
      `${result.role} | ${result.method} | ${result.path} | ${result.level} | ${result.status} | ${result.expected} | ${
        result.pass ? "OK" : "FAIL"
      }`
    );
  }
}

async function main() {
  await waitForServer();

  let adminCookie = ADMIN_COOKIE_OVERRIDE;
  let customerCookie = CUSTOMER_COOKIE_OVERRIDE;

  if (!adminCookie || !customerCookie) {
    try {
      if (!adminCookie) {
        await ensureAdminUser();
        adminCookie = await signInAndGetCookie(ADMIN_EMAIL, ADMIN_PASSWORD);
      }

      if (!customerCookie) {
        await ensureCustomerUser();
        customerCookie = await signInAndGetCookie(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
      }
    } catch (error) {
      if (!ALLOW_PARTIAL) {
        throw error;
      }

      const reason = error instanceof Error ? error.message : String(error);
      console.warn(
        "Aviso: no se pudieron preparar cookies por rol automaticamente. Se ejecutará matriz parcial."
      );
      console.warn(`Motivo: ${reason}`);
    }
  }

  const roles = [{ role: "public", cookie: null }];

  if (customerCookie) {
    roles.push({ role: "customer", cookie: customerCookie });
  } else if (!ALLOW_PARTIAL) {
    throw new Error(
      "No hay cookie de customer. Define ACCESS_MATRIX_CUSTOMER_COOKIE o permite modo parcial con ACCESS_MATRIX_ALLOW_PARTIAL=true."
    );
  }

  if (adminCookie) {
    roles.push({ role: "admin", cookie: adminCookie });
  } else if (!ALLOW_PARTIAL) {
    throw new Error(
      "No hay cookie de admin. Define ACCESS_MATRIX_ADMIN_COOKIE o permite modo parcial con ACCESS_MATRIX_ALLOW_PARTIAL=true."
    );
  }

  const results = [];

  for (const testCase of ACCESS_CASES) {
    for (const entry of roles) {
      const result = await runCase(testCase, entry.role, entry.cookie);
      results.push(result);
    }
  }

  printResults(results);

  const failed = results.filter((result) => !result.pass);

  if (failed.length > 0) {
    console.error("");
    console.error(`Fallaron ${failed.length} validaciones de acceso.`);
    process.exitCode = 1;
    return;
  }

  console.log("");
  if (roles.length < 3) {
    console.log(`OK parcial: ${results.length} validaciones de acceso pasaron.`);
    return;
  }

  console.log(`OK: ${results.length} validaciones de acceso pasaron.`);
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
