import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const SSL_MODES_REQUIRING_COMPAT = new Set(["prefer", "require", "verify-ca"]);
function resolvePrismaConnectionString(rawUrl) {
  if (!rawUrl) return "";
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
  log: ["warn"],
});

try {
  const users = await prisma.user.count();
  const customers = await prisma.customer.count();
  console.log(JSON.stringify({ ok: true, users, customers }));
} catch (error) {
  console.log(
    JSON.stringify({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
      code: error && typeof error === "object" && "code" in error ? error.code : null,
      meta: error && typeof error === "object" && "meta" in error ? error.meta : null,
    })
  );
} finally {
  await prisma.$disconnect();
}
