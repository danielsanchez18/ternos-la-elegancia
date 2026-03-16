type SessionTokenResponse = {
  token: string;
  raw: unknown;
  source: "mock" | "izipay";
};

function isMockModeEnabled() {
  return process.env.IZIPAY_MOCK_MODE === "true";
}

function parseJsonEnv<T extends object>(value: string | undefined, name: string): T {
  if (!value) {
    return {} as T;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as T;
    }

    throw new Error("must be a JSON object");
  } catch {
    throw new Error(`${name} must be a valid JSON object`);
  }
}

function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const source = payload as Record<string, unknown>;

  const directTokenFields = ["token", "access_token", "authorization", "sessionToken"];
  for (const field of directTokenFields) {
    const value = source[field];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  const nested = source.answer;
  if (nested && typeof nested === "object") {
    const nestedObj = nested as Record<string, unknown>;
    for (const field of directTokenFields) {
      const value = nestedObj[field];
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }
  }

  return null;
}

export async function generateIzipaySessionToken(): Promise<SessionTokenResponse> {
  if (isMockModeEnabled()) {
    const mockToken = `mock_izipay_session_${Date.now()}`;

    return {
      token: mockToken,
      raw: {
        mode: "mock",
        message: "Mock mode enabled. No request sent to Izipay.",
      },
      source: "mock",
    };
  }

  const url = process.env.IZIPAY_SESSION_TOKEN_URL;
  if (!url) {
    throw new Error("IZIPAY_SESSION_TOKEN_URL is required");
  }

  const staticAuthorization = process.env.IZIPAY_SESSION_TOKEN_AUTHORIZATION;
  const extraHeaders = parseJsonEnv<Record<string, string>>(
    process.env.IZIPAY_SESSION_TOKEN_EXTRA_HEADERS,
    "IZIPAY_SESSION_TOKEN_EXTRA_HEADERS"
  );
  const bodyPayload = parseJsonEnv<Record<string, unknown>>(
    process.env.IZIPAY_SESSION_TOKEN_BODY,
    "IZIPAY_SESSION_TOKEN_BODY"
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (staticAuthorization) {
    headers.Authorization = staticAuthorization;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyPayload),
    cache: "no-store",
  });

  const rawResponse = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      `Izipay token request failed with status ${response.status}`
    );
  }

  const token = extractToken(rawResponse);
  if (!token) {
    throw new Error("Izipay token response does not include a token field");
  }

  return {
    token,
    raw: rawResponse,
    source: "izipay",
  };
}
