import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const BASE_URL = (
  process.env.PHASE5_BASE_URL ??
  process.env.ACCESS_MATRIX_BASE_URL ??
  "http://127.0.0.1:3000"
).replace(/\/$/, "");

const ADMIN_COOKIE =
  process.env.PHASE5_ADMIN_COOKIE?.trim() ||
  process.env.ACCESS_MATRIX_ADMIN_COOKIE?.trim() ||
  null;
const ADMIN_EMAIL =
  process.env.PHASE5_ADMIN_EMAIL?.trim().toLowerCase() ||
  process.env.ACCESS_MATRIX_ADMIN_EMAIL?.trim().toLowerCase() ||
  "";
const ADMIN_PASSWORD =
  process.env.PHASE5_ADMIN_PASSWORD?.trim() ||
  process.env.ACCESS_MATRIX_ADMIN_PASSWORD?.trim() ||
  "";

const ALLOW_PARTIAL =
  process.env.PHASE5_ALLOW_PARTIAL === "true" ||
  process.env.ACCESS_MATRIX_ALLOW_PARTIAL === "true";

const REQUEST_TIMEOUT_MS = Number(process.env.PHASE5_REQUEST_TIMEOUT_MS ?? 15000);
const GARMENT_TYPE = process.env.PHASE5_GARMENT_TYPE?.trim() || "SACO_CABALLERO";

const ANSI = {
  reset: "\u001b[0m",
  green: "\u001b[32m",
  red: "\u001b[31m",
  yellow: "\u001b[33m",
  cyan: "\u001b[36m",
  dim: "\u001b[2m",
};

function color(text, code) {
  if (!process.stdout.isTTY) {
    return text;
  }

  return `${code}${text}${ANSI.reset}`;
}

function statusLabel(status) {
  if (status === "PASS") {
    return color(status, ANSI.green);
  }

  if (status === "FAIL") {
    return color(status, ANSI.red);
  }

  return color(status, ANSI.yellow);
}

function printSection(title) {
  console.log("");
  console.log(color(title, ANSI.cyan));
}

function normalizeBody(body) {
  if (body === undefined || body === null) {
    return undefined;
  }

  return JSON.stringify(body);
}

function headersFromCookie(cookie) {
  return cookie ? { cookie } : {};
}

function buildCookieHeaderFromSetCookie(setCookieHeaders) {
  return setCookieHeaders.map((cookie) => cookie.split(";")[0]).join("; ");
}

async function signInAndGetCookie(email, password) {
  const loginBaseUrls = [BASE_URL];
  if (BASE_URL.includes("127.0.0.1")) {
    loginBaseUrls.push(BASE_URL.replace("127.0.0.1", "localhost"));
  }

  let lastError = "unknown error";

  for (const loginBaseUrl of loginBaseUrls) {
    const response = await fetch(`${loginBaseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: loginBaseUrl,
      },
      body: JSON.stringify({
        email,
        password,
        rememberMe: false,
      }),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const payload = await response.text();
      lastError = `Base ${loginBaseUrl} -> Status ${response.status}. Respuesta: ${payload}`;
      continue;
    }

    const setCookie =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : (() => {
            const single = response.headers.get("set-cookie");
            return single ? [single] : [];
          })();

    if (setCookie.length === 0) {
      lastError = `Base ${loginBaseUrl} -> No se recibieron cookies de sesión.`;
      continue;
    }

    return buildCookieHeaderFromSetCookie(setCookie);
  }

  throw new Error(`No se pudo iniciar sesión admin para fase 5. ${lastError}`);
}

async function waitForServer(maxAttempts = 20) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${BASE_URL}/api/session-access`, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.ok || response.status === 401 || response.status === 403) {
        return;
      }
    } catch {
      // keep trying
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(
    `No se pudo conectar al servidor en ${BASE_URL}. Inicia la app y vuelve a ejecutar.`
  );
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: options.headers,
    body: normalizeBody(options.body),
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(options.timeoutMs ?? REQUEST_TIMEOUT_MS),
  });

  const text = await response.text();
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    json,
    text,
  };
}

function recordCheck(results, checkName, status, message) {
  results.push({ checkName, status, message });
}

function randomSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function buildCustomerPayload() {
  const suffix = randomSuffix();
  return {
    nombres: "Phase5",
    apellidos: `Test ${suffix}`,
    email: `phase5-${suffix}@laelegancia.test`,
    dni: `${Math.floor(10_000_000 + Math.random() * 89_999_999)}`,
    password: "Phase5Pass#123",
    celular: "999888777",
  };
}

function buildOrderPayload(customerId) {
  return {
    customerId,
    notes: "Validacion fase 5",
    items: [
      {
        itemNameSnapshot: "Prenda prueba fase 5",
        quantity: 1,
        unitPrice: 120,
        parts: [
          {
            garmentType: GARMENT_TYPE,
            label: "Pieza principal",
          },
        ],
      },
    ],
  };
}

function dayDiffAbs(a, b) {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.abs(a.getTime() - b.getTime()) / dayMs;
}

async function run() {
  await waitForServer();

  const results = [];
  let adminCookie = ADMIN_COOKIE;

  printSection("Fase 5 - Measurement Profiles");
  console.log(color(`Base URL: ${BASE_URL}`, ANSI.dim));
  console.log(
    color(
      `Cookie admin=${adminCookie ? "yes" : "no"} partial=${ALLOW_PARTIAL ? "yes" : "no"} garmentType=${GARMENT_TYPE}`,
      ANSI.dim
    )
  );

  const unauthorizedCustomers = await requestJson("/api/customers");
  if (unauthorizedCustomers.status === 401) {
    recordCheck(
      results,
      "GET /api/customers sin cookie bloquea acceso",
      "PASS",
      "401 as expected"
    );
  } else {
    recordCheck(
      results,
      "GET /api/customers sin cookie bloquea acceso",
      "FAIL",
      `Expected 401, got ${unauthorizedCustomers.status}`
    );
  }

  if (adminCookie) {
    const authProbe = await requestJson("/api/customers", {
      headers: headersFromCookie(adminCookie),
    });

    if (authProbe.status === 401 && ADMIN_EMAIL && ADMIN_PASSWORD) {
      try {
        adminCookie = await signInAndGetCookie(ADMIN_EMAIL, ADMIN_PASSWORD);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        console.warn(color(`Aviso: ${reason}`, ANSI.yellow));
      }
    }
  }

  if (!adminCookie) {
    if (ALLOW_PARTIAL) {
      recordCheck(
        results,
        "Flujo fase 5 con admin",
        "SKIP",
        "No admin cookie configured"
      );
    } else {
      recordCheck(
        results,
        "Flujo fase 5 con admin",
        "FAIL",
        "No admin cookie configured"
      );
    }
  } else {
    const adminHeaders = {
      ...headersFromCookie(adminCookie),
      "content-type": "application/json",
    };

    const customerPayload = buildCustomerPayload();
    const createCustomer = await requestJson("/api/customers", {
      method: "POST",
      headers: adminHeaders,
      body: customerPayload,
    });

    if (!createCustomer.ok || !createCustomer.json?.id) {
      recordCheck(
        results,
        "POST /api/customers crea cliente de prueba",
        "FAIL",
        `Expected 201, got ${createCustomer.status}`
      );
    } else {
      const customerId = createCustomer.json.id;
      recordCheck(
        results,
        "POST /api/customers crea cliente de prueba",
        "PASS",
        `Customer ${customerId}`
      );

      const orderWithoutMeasurements = await requestJson("/api/custom-orders", {
        method: "POST",
        headers: adminHeaders,
        body: buildOrderPayload(customerId),
      });

      if (
        orderWithoutMeasurements.ok &&
        orderWithoutMeasurements.json?.requiresMeasurement === true
      ) {
        recordCheck(
          results,
          "POST /api/custom-orders detecta falta de medidas",
          "PASS",
          `Order ${orderWithoutMeasurements.json.id} requiresMeasurement=true`
        );
      } else {
        recordCheck(
          results,
          "POST /api/custom-orders detecta falta de medidas",
          "FAIL",
          `Expected requiresMeasurement=true, got status=${orderWithoutMeasurements.status}`
        );
      }

      const takenAt = new Date();
      takenAt.setUTCHours(12, 0, 0, 0);
      const expectedValidUntil = new Date(takenAt);
      expectedValidUntil.setMonth(expectedValidUntil.getMonth() + 3);

      const createProfile = await requestJson(
        `/api/customers/${customerId}/measurement-profiles`,
        {
          method: "POST",
          headers: adminHeaders,
          body: {
            takenAt: takenAt.toISOString(),
            notes: "Perfil de prueba fase 5",
            garmentTypes: [GARMENT_TYPE],
          },
        }
      );

      let profileId = null;
      if (!createProfile.ok || !createProfile.json?.id) {
        recordCheck(
          results,
          "POST /api/customers/:id/measurement-profiles crea perfil",
          "FAIL",
          `Expected 201, got ${createProfile.status}`
        );
      } else {
        profileId = createProfile.json.id;
        const validUntil = new Date(createProfile.json.validUntil);
        const diffDays = dayDiffAbs(validUntil, expectedValidUntil);

        if (diffDays <= 1) {
          recordCheck(
            results,
            "Vigencia de perfil es 3 meses",
            "PASS",
            `validUntil=${createProfile.json.validUntil}`
          );
        } else {
          recordCheck(
            results,
            "Vigencia de perfil es 3 meses",
            "FAIL",
            `Expected near ${expectedValidUntil.toISOString()}, got ${createProfile.json.validUntil}`
          );
        }
      }

      const orderWithProfile = await requestJson("/api/custom-orders", {
        method: "POST",
        headers: adminHeaders,
        body: buildOrderPayload(customerId),
      });

      let orderWithProfileId = null;
      if (
        orderWithProfile.ok &&
        orderWithProfile.json?.requiresMeasurement === false &&
        orderWithProfile.json?.id
      ) {
        orderWithProfileId = orderWithProfile.json.id;
        recordCheck(
          results,
          "POST /api/custom-orders usa perfil vigente y no exige nueva toma",
          "PASS",
          `Order ${orderWithProfileId} requiresMeasurement=false`
        );
      } else {
        recordCheck(
          results,
          "POST /api/custom-orders usa perfil vigente y no exige nueva toma",
          "FAIL",
          `Expected requiresMeasurement=false, got status=${orderWithProfile.status}`
        );
      }

      if (profileId && orderWithProfileId) {
        const deactivateProfile = await requestJson(`/api/measurement-profiles/${profileId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { isActive: false },
        });

        if (deactivateProfile.ok && deactivateProfile.json?.isActive === false) {
          recordCheck(
            results,
            "PATCH /api/measurement-profiles/:id permite desactivar perfil",
            "PASS",
            `Profile ${profileId} isActive=false`
          );
        } else {
          recordCheck(
            results,
            "PATCH /api/measurement-profiles/:id permite desactivar perfil",
            "FAIL",
            `Expected 200 with isActive=false, got ${deactivateProfile.status}`
          );
        }

        const updatedOrder = await requestJson(`/api/custom-orders/${orderWithProfileId}`, {
          method: "PUT",
          headers: adminHeaders,
          body: {
            notes: "Recalculo de medidas fase 5",
            items: buildOrderPayload(customerId).items,
          },
        });

        if (
          updatedOrder.ok &&
          updatedOrder.json?.requiresMeasurement === true &&
          updatedOrder.json?.measurementRequiredUntil
        ) {
          recordCheck(
            results,
            "PUT /api/custom-orders/:id recalcula requiere nueva toma de medidas",
            "PASS",
            `measurementRequiredUntil=${updatedOrder.json.measurementRequiredUntil}`
          );
        } else {
          recordCheck(
            results,
            "PUT /api/custom-orders/:id recalcula requiere nueva toma de medidas",
            "FAIL",
            `Expected requiresMeasurement=true, got status=${updatedOrder.status}`
          );
        }
      } else if (ALLOW_PARTIAL) {
        recordCheck(
          results,
          "PUT /api/custom-orders/:id recalcula requiere nueva toma de medidas",
          "SKIP",
          "Skipped because profile/order setup was incomplete"
        );
      } else {
        recordCheck(
          results,
          "PUT /api/custom-orders/:id recalcula requiere nueva toma de medidas",
          "FAIL",
          "Skipped because profile/order setup was incomplete"
        );
      }
    }
  }

  console.log("");
  console.log("Reporte de Fase 5");
  console.log("check | status | detail");
  console.log("--- | --- | ---");

  for (const result of results) {
    console.log(`${result.checkName} | ${statusLabel(result.status)} | ${result.message}`);
  }

  const failed = results.filter((result) => result.status === "FAIL");
  const skipped = results.filter((result) => result.status === "SKIP");

  console.log("");
  console.log(
    `PASS: ${results.length - failed.length - skipped.length} | FAIL: ${failed.length} | SKIP: ${skipped.length}`
  );

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

void run().catch((error) => {
  console.error(color(`Error: ${error instanceof Error ? error.message : String(error)}`, ANSI.red));
  process.exitCode = 1;
});
