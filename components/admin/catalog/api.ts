export async function parseApiError(
  response: Response,
  fallbackMessage: string
): Promise<string> {
  const payload = await response.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return fallbackMessage;
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  if (
    "issues" in payload &&
    Array.isArray(payload.issues) &&
    payload.issues.length > 0
  ) {
    const firstIssue = payload.issues[0];
    if (
      firstIssue &&
      typeof firstIssue === "object" &&
      "message" in firstIssue &&
      typeof firstIssue.message === "string"
    ) {
      return firstIssue.message;
    }
  }

  return fallbackMessage;
}

async function requestJson<T>(
  url: string,
  init: RequestInit = {},
  fallbackError = "No se pudo completar la solicitud."
): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, fallbackError));
  }

  return (await response.json()) as T;
}

export function apiGet<T>(url: string, fallbackError?: string): Promise<T> {
  return requestJson<T>(url, { method: "GET" }, fallbackError);
}

export function apiPost<T>(
  url: string,
  body: unknown,
  fallbackError?: string
): Promise<T> {
  return requestJson<T>(
    url,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    fallbackError
  );
}

export function apiPatch<T>(
  url: string,
  body: unknown,
  fallbackError?: string
): Promise<T> {
  return requestJson<T>(
    url,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    fallbackError
  );
}

