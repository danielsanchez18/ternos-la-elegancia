const SSL_MODES_REQUIRING_COMPAT = new Set(["prefer", "require", "verify-ca"]);

export function resolvePrismaConnectionString(rawUrl: string | undefined): string {
  if (!rawUrl) {
    return "";
  }

  let parsed: URL;

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