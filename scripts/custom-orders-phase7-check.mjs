import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const BASE_URL = (
  process.env.PHASE7_BASE_URL ??
  process.env.ACCESS_MATRIX_BASE_URL ??
  "http://127.0.0.1:3000"
).replace(/\/$/, "");

const ADMIN_COOKIE =
  process.env.PHASE7_ADMIN_COOKIE?.trim() ||
  process.env.ACCESS_MATRIX_ADMIN_COOKIE?.trim() ||
  null;
const ADMIN_EMAIL =
  process.env.PHASE7_ADMIN_EMAIL?.trim().toLowerCase() ||
  process.env.ACCESS_MATRIX_ADMIN_EMAIL?.trim().toLowerCase() ||
  "";
const ADMIN_PASSWORD =
  process.env.PHASE7_ADMIN_PASSWORD?.trim() ||
  process.env.ACCESS_MATRIX_ADMIN_PASSWORD?.trim() ||
  "";

const ALLOW_PARTIAL =
  process.env.PHASE7_ALLOW_PARTIAL === "true" ||
  process.env.ACCESS_MATRIX_ALLOW_PARTIAL === "true";

const REQUEST_TIMEOUT_MS = Number(process.env.PHASE7_REQUEST_TIMEOUT_MS ?? 15000);

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
      lastError = `Base ${loginBaseUrl} -> No se recibieron cookies de sesion.`;
      continue;
    }

    return buildCookieHeaderFromSetCookie(setCookie);
  }

  throw new Error(`No se pudo iniciar sesion admin para fase 7. ${lastError}`);
}

async function ensureCustomer(adminCookie) {
  const list = await requestJson("/api/customers", {
    headers: headersFromCookie(adminCookie),
  });

  if (list.ok && Array.isArray(list.json) && list.json.length > 0) {
    return { id: list.json[0].id, created: false };
  }

  const suffix = randomSuffix();
  const createPayload = {
    nombres: "Fase7",
    apellidos: `QA-${suffix}`,
    email: `fase7-${suffix}@example.com`,
    celular: "999888777",
    dni: `${Math.floor(10_000_000 + Math.random() * 89_999_999)}`,
    password: "LaElegancia123#",
  };

  const created = await requestJson("/api/customers", {
    method: "POST",
    headers: {
      ...headersFromCookie(adminCookie),
      "content-type": "application/json",
    },
    body: createPayload,
  });

  if (!created.ok || !created.json?.id) {
    throw new Error(`No se pudo obtener/crear cliente. Status: ${created.status}`);
  }

  return { id: created.json.id, created: true };
}

function buildFabricPayload() {
  const suffix = randomSuffix();
  return {
    code: `PHASE7-FAB-${suffix}`,
    nombre: `Tela Fase 7 ${suffix}`,
    color: "Azul",
    supplier: "QA",
    composition: "Prueba",
    pattern: "Liso",
    metersInStock: 12,
    minMeters: 1,
    costPerMeter: 20,
    pricePerMeter: 35,
    active: true,
  };
}

async function ensureFabric(adminCookie) {
  const list = await requestJson("/api/fabrics", {
    headers: headersFromCookie(adminCookie),
  });

  if (list.ok && Array.isArray(list.json)) {
    const activeFabric = list.json.find((fabric) => fabric.active !== false);
    if (activeFabric?.id) {
      return { id: activeFabric.id, created: false };
    }
  }

  const created = await requestJson("/api/fabrics", {
    method: "POST",
    headers: {
      ...headersFromCookie(adminCookie),
      "content-type": "application/json",
    },
    body: buildFabricPayload(),
  });

  if (!created.ok || !created.json?.id) {
    throw new Error(`No se pudo obtener/crear tela. Status: ${created.status}`);
  }

  return { id: created.json.id, created: true };
}

function buildCustomOrderPayload(customerId, fabricId) {
  const now = Date.now();
  const requestedDeliveryAt = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
  const promisedDeliveryAt = new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString();
  const suffix = randomSuffix();

  return {
    customerId,
    firstPurchaseFlow: true,
    requestedDeliveryAt,
    promisedDeliveryAt,
    notes: "Orden de validacion Fase 7",
    internalNotes: "QA - custom orders",
    items: [
      {
        itemNameSnapshot: `Traje personalizado ${suffix}`,
        quantity: 1,
        unitPrice: 600,
        discountAmount: 0,
        notes: "Item para pruebas",
        parts: [
          {
            garmentType: "SACO_CABALLERO",
            label: "Saco principal",
            workMode: "A_TODO_COSTO",
            fabricId,
            unitPrice: 600,
            notes: "Parte principal",
          },
        ],
      },
    ],
  };
}

function buildPaymentPayload(amount) {
  return {
    amount,
    method: "YAPE",
    concept: "ADELANTO",
    status: "APROBADO",
    provider: "YAPE",
    operationCode: `PH7-OP-${randomSuffix()}`,
    approvalCode: `PH7-APR-${randomSuffix()}`,
    paidAt: new Date().toISOString(),
    notes: "Pago de validacion Fase 7",
  };
}

async function run() {
  await waitForServer();

  const results = [];
  let adminCookie = ADMIN_COOKIE;

  printSection("Fase 7 - Custom Orders + Payments");
  console.log(color(`Base URL: ${BASE_URL}`, ANSI.dim));
  console.log(
    color(
      `Cookie admin=${adminCookie ? "yes" : "no"} partial=${ALLOW_PARTIAL ? "yes" : "no"}`,
      ANSI.dim
    )
  );

  const unauthorizedCustomOrders = await requestJson("/api/custom-orders");
  if (unauthorizedCustomOrders.status === 401) {
    recordCheck(
      results,
      "GET /api/custom-orders sin cookie bloquea acceso",
      "PASS",
      "401 as expected"
    );
  } else {
    recordCheck(
      results,
      "GET /api/custom-orders sin cookie bloquea acceso",
      "FAIL",
      `Expected 401, got ${unauthorizedCustomOrders.status}`
    );
  }

  if (adminCookie) {
    const authProbe = await requestJson("/api/custom-orders", {
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
      recordCheck(results, "Flujo fase 7 con admin", "SKIP", "No admin cookie configured");
    } else {
      recordCheck(results, "Flujo fase 7 con admin", "FAIL", "No admin cookie configured");
    }
  } else {
    const adminHeaders = {
      ...headersFromCookie(adminCookie),
      "content-type": "application/json",
    };

    let customerId = null;
    let fabricId = null;

    try {
      const customer = await ensureCustomer(adminCookie);
      const fabric = await ensureFabric(adminCookie);
      customerId = customer.id;
      fabricId = fabric.id;
      recordCheck(
        results,
        "Prerequisitos (cliente y tela) disponibles",
        "PASS",
        `customer=${customerId} fabric=${fabricId}`
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      recordCheck(results, "Prerequisitos (cliente y tela) disponibles", "FAIL", detail);
    }

    if (customerId && fabricId) {
      const createOrder = await requestJson("/api/custom-orders", {
        method: "POST",
        headers: adminHeaders,
        body: buildCustomOrderPayload(customerId, fabricId),
      });

      if (!createOrder.ok || !createOrder.json?.id) {
        recordCheck(
          results,
          "POST /api/custom-orders crea orden base",
          "FAIL",
          `Expected 201, got ${createOrder.status}`
        );
      } else {
        const order = createOrder.json;
        const orderId = order.id;
        const total = toNumber(order.total);
        const firstPart = order.items?.[0]?.parts?.[0];

        recordCheck(
          results,
          "POST /api/custom-orders crea orden base",
          "PASS",
          `order=${orderId} status=${order.status}`
        );

        if (order.status === "PENDIENTE_RESERVA" && order.requiresMeasurement === true) {
          recordCheck(
            results,
            "Orden inicia en estado de reserva con medidas requeridas",
            "PASS",
            "status=PENDIENTE_RESERVA requiresMeasurement=true"
          );
        } else {
          recordCheck(
            results,
            "Orden inicia en estado de reserva con medidas requeridas",
            "FAIL",
            `status=${order.status} requiresMeasurement=${order.requiresMeasurement}`
          );
        }

        if (
          firstPart?.fabricId === fabricId &&
          typeof firstPart?.fabricNameSnapshot === "string" &&
          firstPart.fabricNameSnapshot.length > 0
        ) {
          recordCheck(
            results,
            "Orden guarda snapshot de tela",
            "PASS",
            `fabricSnapshot=${firstPart.fabricNameSnapshot}`
          );
        } else {
          recordCheck(
            results,
            "Orden guarda snapshot de tela",
            "FAIL",
            "No se encontro snapshot de tela en la parte creada"
          );
        }

        const invalidTransition = await requestJson(`/api/custom-orders/${orderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "START_CONFECTION", note: "Debe fallar en pendiente" },
        });
        if (invalidTransition.status === 409) {
          recordCheck(
            results,
            "START_CONFECTION bloqueado desde estado no valido",
            "PASS",
            "409 as expected"
          );
        } else {
          recordCheck(
            results,
            "START_CONFECTION bloqueado desde estado no valido",
            "FAIL",
            `Expected 409, got ${invalidTransition.status}`
          );
        }

        const confirmReservation = await requestJson(`/api/custom-orders/${orderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "CONFIRM_RESERVATION", note: "QA reserva confirmada" },
        });
        if (confirmReservation.ok && confirmReservation.json?.status === "RESERVA_CONFIRMADA") {
          recordCheck(
            results,
            "CONFIRM_RESERVATION cambia estado",
            "PASS",
            "status=RESERVA_CONFIRMADA"
          );
        } else {
          recordCheck(
            results,
            "CONFIRM_RESERVATION cambia estado",
            "FAIL",
            `Expected RESERVA_CONFIRMADA, got status=${confirmReservation.status}`
          );
        }

        const withoutMeasurements = await requestJson(`/api/custom-orders/${orderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "START_CONFECTION", note: "Debe fallar por medidas pendientes" },
        });
        if (withoutMeasurements.status === 409) {
          recordCheck(
            results,
            "START_CONFECTION bloqueado si faltan medidas",
            "PASS",
            "409 as expected"
          );
        } else {
          recordCheck(
            results,
            "START_CONFECTION bloqueado si faltan medidas",
            "FAIL",
            `Expected 409, got ${withoutMeasurements.status}`
          );
        }

        const markMeasurementsTaken = await requestJson(`/api/custom-orders/${orderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "MARK_MEASUREMENTS_TAKEN", note: "QA medidas tomadas" },
        });
        if (markMeasurementsTaken.ok && markMeasurementsTaken.json?.status === "MEDIDAS_TOMADAS") {
          recordCheck(
            results,
            "MARK_MEASUREMENTS_TAKEN habilita avance",
            "PASS",
            `status=${markMeasurementsTaken.json.status}`
          );
        } else {
          recordCheck(
            results,
            "MARK_MEASUREMENTS_TAKEN habilita avance",
            "FAIL",
            `Expected MEDIDAS_TOMADAS, got status=${markMeasurementsTaken.status}`
          );
        }

        const withoutAdvance = await requestJson(`/api/custom-orders/${orderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "START_CONFECTION", note: "Debe fallar por adelanto insuficiente" },
        });
        if (withoutAdvance.status === 409) {
          recordCheck(
            results,
            "START_CONFECTION bloqueado sin adelanto minimo",
            "PASS",
            "409 as expected"
          );
        } else {
          recordCheck(
            results,
            "START_CONFECTION bloqueado sin adelanto minimo",
            "FAIL",
            `Expected 409, got ${withoutAdvance.status}`
          );
        }

        const firstPayment = await requestJson(`/api/custom-orders/${orderId}/payments`, {
          method: "POST",
          headers: adminHeaders,
          body: buildPaymentPayload(200),
        });
        if (firstPayment.ok) {
          recordCheck(
            results,
            "POST primer pago parcial",
            "PASS",
            "Pago parcial registrado"
          );
        } else {
          recordCheck(
            results,
            "POST primer pago parcial",
            "FAIL",
            `Expected 201, got ${firstPayment.status}`
          );
        }

        const stillNoAdvance = await requestJson(`/api/custom-orders/${orderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "START_CONFECTION", note: "Aun no llega al 50%" },
        });
        if (stillNoAdvance.status === 409) {
          recordCheck(
            results,
            "START_CONFECTION sigue bloqueado bajo 50%",
            "PASS",
            "409 as expected"
          );
        } else {
          recordCheck(
            results,
            "START_CONFECTION sigue bloqueado bajo 50%",
            "FAIL",
            `Expected 409, got ${stillNoAdvance.status}`
          );
        }

        const secondPayment = await requestJson(`/api/custom-orders/${orderId}/payments`, {
          method: "POST",
          headers: adminHeaders,
          body: buildPaymentPayload(100),
        });
        if (secondPayment.ok) {
          recordCheck(
            results,
            "POST segundo pago alcanza 50%",
            "PASS",
            "Pago para completar adelanto minimo registrado"
          );
        } else {
          recordCheck(
            results,
            "POST segundo pago alcanza 50%",
            "FAIL",
            `Expected 201, got ${secondPayment.status}`
          );
        }

        const startConfection = await requestJson(`/api/custom-orders/${orderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "START_CONFECTION", note: "QA inicia confeccion" },
        });
        if (startConfection.ok && startConfection.json?.status === "EN_CONFECCION") {
          recordCheck(
            results,
            "START_CONFECTION permitido con medidas y adelanto",
            "PASS",
            "status=EN_CONFECCION"
          );
        } else {
          recordCheck(
            results,
            "START_CONFECTION permitido con medidas y adelanto",
            "FAIL",
            `Expected EN_CONFECCION, got status=${startConfection.status}`
          );
        }

        const paymentSummary = await requestJson(`/api/custom-orders/${orderId}/payments`, {
          headers: headersFromCookie(adminCookie),
        });
        const approvedPaid = toNumber(paymentSummary.json?.summary?.approvedPaymentsTotal);
        const hasRequiredAdvance = paymentSummary.json?.summary?.hasRequiredAdvance === true;
        const reachedMinimum = Number.isFinite(total) ? approvedPaid >= total * 0.5 : false;

        if (paymentSummary.ok && hasRequiredAdvance && reachedMinimum) {
          recordCheck(
            results,
            "Resumen financiero refleja adelanto minimo",
            "PASS",
            `approved=${approvedPaid} total=${total}`
          );
        } else {
          recordCheck(
            results,
            "Resumen financiero refleja adelanto minimo",
            "FAIL",
            `Expected hasRequiredAdvance=true, got status=${paymentSummary.status}`
          );
        }
      }
    }
  }

  console.log("");
  console.log("Reporte de Fase 7");
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
