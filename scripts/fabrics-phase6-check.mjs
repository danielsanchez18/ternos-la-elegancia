import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const BASE_URL = (
  process.env.PHASE6_BASE_URL ??
  process.env.ACCESS_MATRIX_BASE_URL ??
  "http://127.0.0.1:3000"
).replace(/\/$/, "");

const ADMIN_COOKIE =
  process.env.PHASE6_ADMIN_COOKIE?.trim() ||
  process.env.ACCESS_MATRIX_ADMIN_COOKIE?.trim() ||
  null;
const ADMIN_EMAIL =
  process.env.PHASE6_ADMIN_EMAIL?.trim().toLowerCase() ||
  process.env.ACCESS_MATRIX_ADMIN_EMAIL?.trim().toLowerCase() ||
  "";
const ADMIN_PASSWORD =
  process.env.PHASE6_ADMIN_PASSWORD?.trim() ||
  process.env.ACCESS_MATRIX_ADMIN_PASSWORD?.trim() ||
  "";

const ALLOW_PARTIAL =
  process.env.PHASE6_ALLOW_PARTIAL === "true" ||
  process.env.ACCESS_MATRIX_ALLOW_PARTIAL === "true";

const REQUEST_TIMEOUT_MS = Number(process.env.PHASE6_REQUEST_TIMEOUT_MS ?? 15000);

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

function recordCheck(results, checkName, status, message) {
  results.push({ checkName, status, message });
}

function toNumber(value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return NaN;
}

function isClose(actual, expected, epsilon = 0.0001) {
  return Number.isFinite(actual) && Math.abs(actual - expected) <= epsilon;
}

function randomSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
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

  throw new Error(`No se pudo iniciar sesión admin para fase 6. ${lastError}`);
}

function buildFabricPayload() {
  const suffix = randomSuffix();
  return {
    code: `PHASE6-FAB-${suffix}`,
    nombre: `Tela Fase 6 ${suffix}`,
    color: "Azul",
    supplier: "QA",
    composition: "Prueba",
    pattern: "Liso",
    metersInStock: 5,
    minMeters: 1,
    costPerMeter: 20,
    pricePerMeter: 35,
    active: true,
  };
}

async function run() {
  await waitForServer();

  const results = [];
  let adminCookie = ADMIN_COOKIE;

  printSection("Fase 6 - Fabrics e Inventario");
  console.log(color(`Base URL: ${BASE_URL}`, ANSI.dim));
  console.log(
    color(
      `Cookie admin=${adminCookie ? "yes" : "no"} partial=${ALLOW_PARTIAL ? "yes" : "no"}`,
      ANSI.dim
    )
  );

  const unauthorizedFabrics = await requestJson("/api/fabrics");
  if (unauthorizedFabrics.status === 401) {
    recordCheck(
      results,
      "GET /api/fabrics sin cookie bloquea acceso",
      "PASS",
      "401 as expected"
    );
  } else {
    recordCheck(
      results,
      "GET /api/fabrics sin cookie bloquea acceso",
      "FAIL",
      `Expected 401, got ${unauthorizedFabrics.status}`
    );
  }

  if (adminCookie) {
    const authProbe = await requestJson("/api/fabrics", {
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
      recordCheck(results, "Flujo fase 6 con admin", "SKIP", "No admin cookie configured");
    } else {
      recordCheck(results, "Flujo fase 6 con admin", "FAIL", "No admin cookie configured");
    }
  } else {
    const adminHeaders = {
      ...headersFromCookie(adminCookie),
      "content-type": "application/json",
    };

    const createFabric = await requestJson("/api/fabrics", {
      method: "POST",
      headers: adminHeaders,
      body: buildFabricPayload(),
    });

    if (!createFabric.ok || !createFabric.json?.id) {
      recordCheck(
        results,
        "POST /api/fabrics crea tela",
        "FAIL",
        `Expected 201, got ${createFabric.status}`
      );
    } else {
      const fabricId = createFabric.json.id;
      recordCheck(results, "POST /api/fabrics crea tela", "PASS", `Fabric ${fabricId}`);

      const detail = await requestJson(`/api/fabrics/${fabricId}`, {
        headers: headersFromCookie(adminCookie),
      });
      if (detail.ok && detail.json?.id === fabricId) {
        recordCheck(results, "GET /api/fabrics/:id devuelve detalle", "PASS", "Detalle obtenido");
      } else {
        recordCheck(
          results,
          "GET /api/fabrics/:id devuelve detalle",
          "FAIL",
          `Expected 200, got ${detail.status}`
        );
      }

      const patchFabric = await requestJson(`/api/fabrics/${fabricId}`, {
        method: "PATCH",
        headers: adminHeaders,
        body: { minMeters: 2, supplier: "QA-UPDATED" },
      });
      if (patchFabric.ok && toNumber(patchFabric.json?.minMeters) === 2) {
        recordCheck(results, "PATCH /api/fabrics/:id actualiza campos", "PASS", "minMeters=2");
      } else {
        recordCheck(
          results,
          "PATCH /api/fabrics/:id actualiza campos",
          "FAIL",
          `Expected minMeters=2, got status=${patchFabric.status}`
        );
      }

      const ingreso = await requestJson(`/api/fabrics/${fabricId}/movements`, {
        method: "POST",
        headers: adminHeaders,
        body: {
          type: "INGRESO",
          quantity: 3,
          note: "Ingreso de prueba Fase 6",
        },
      });
      if (ingreso.ok && isClose(toNumber(ingreso.json?.fabric?.metersInStock), 8)) {
        recordCheck(
          results,
          "POST movimiento INGRESO incrementa stock",
          "PASS",
          `stock=${ingreso.json.fabric.metersInStock}`
        );
      } else {
        recordCheck(
          results,
          "POST movimiento INGRESO incrementa stock",
          "FAIL",
          `Expected stock=8, got status=${ingreso.status}`
        );
      }

      const venta = await requestJson(`/api/fabrics/${fabricId}/movements`, {
        method: "POST",
        headers: adminHeaders,
        body: {
          type: "VENTA",
          quantity: 2,
          note: "Salida de prueba Fase 6",
        },
      });
      if (venta.ok && isClose(toNumber(venta.json?.fabric?.metersInStock), 6)) {
        recordCheck(
          results,
          "POST movimiento VENTA descuenta stock",
          "PASS",
          `stock=${venta.json.fabric.metersInStock}`
        );
      } else {
        recordCheck(
          results,
          "POST movimiento VENTA descuenta stock",
          "FAIL",
          `Expected stock=6, got status=${venta.status}`
        );
      }

      const invalidOut = await requestJson(`/api/fabrics/${fabricId}/movements`, {
        method: "POST",
        headers: adminHeaders,
        body: {
          type: "MERMA",
          quantity: 999,
          note: "Debe fallar por stock negativo",
        },
      });
      if (invalidOut.status === 409) {
        recordCheck(
          results,
          "POST movimiento sin stock suficiente es bloqueado",
          "PASS",
          "409 as expected"
        );
      } else {
        recordCheck(
          results,
          "POST movimiento sin stock suficiente es bloqueado",
          "FAIL",
          `Expected 409, got ${invalidOut.status}`
        );
      }

      const listMovements = await requestJson(`/api/fabrics/${fabricId}/movements`, {
        headers: headersFromCookie(adminCookie),
      });
      if (
        listMovements.ok &&
        Array.isArray(listMovements.json) &&
        listMovements.json.length >= 2 &&
        listMovements.json.every((movement) => movement.happenedAt && movement.type)
      ) {
        recordCheck(
          results,
          "GET /api/fabrics/:id/movements traza historial auditable",
          "PASS",
          `${listMovements.json.length} movimientos`
        );
      } else {
        recordCheck(
          results,
          "GET /api/fabrics/:id/movements traza historial auditable",
          "FAIL",
          `Expected >=2 movimientos, got status=${listMovements.status}`
        );
      }

      const deactivate = await requestJson(`/api/fabrics/${fabricId}`, {
        method: "DELETE",
        headers: headersFromCookie(adminCookie),
      });
      if (deactivate.ok && deactivate.json?.active === false) {
        recordCheck(results, "DELETE /api/fabrics/:id desactiva tela", "PASS", "active=false");
      } else {
        recordCheck(
          results,
          "DELETE /api/fabrics/:id desactiva tela",
          "FAIL",
          `Expected active=false, got status=${deactivate.status}`
        );
      }
    }
  }

  console.log("");
  console.log("Reporte de Fase 6");
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
