import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const BASE_URL = (
  process.env.PHASE8_BASE_URL ??
  process.env.PHASE7_BASE_URL ??
  process.env.ACCESS_MATRIX_BASE_URL ??
  "http://127.0.0.1:3000"
).replace(/\/$/, "");

const ADMIN_COOKIE =
  process.env.PHASE8_ADMIN_COOKIE?.trim() ||
  process.env.PHASE7_ADMIN_COOKIE?.trim() ||
  process.env.ACCESS_MATRIX_ADMIN_COOKIE?.trim() ||
  null;

const ADMIN_EMAIL =
  process.env.PHASE8_ADMIN_EMAIL?.trim().toLowerCase() ||
  process.env.PHASE7_ADMIN_EMAIL?.trim().toLowerCase() ||
  process.env.ACCESS_MATRIX_ADMIN_EMAIL?.trim().toLowerCase() ||
  "";

const ADMIN_PASSWORD =
  process.env.PHASE8_ADMIN_PASSWORD?.trim() ||
  process.env.PHASE7_ADMIN_PASSWORD?.trim() ||
  process.env.ACCESS_MATRIX_ADMIN_PASSWORD?.trim() ||
  "";

const ALLOW_PARTIAL =
  process.env.PHASE8_ALLOW_PARTIAL === "true" ||
  process.env.PHASE7_ALLOW_PARTIAL === "true" ||
  process.env.ACCESS_MATRIX_ALLOW_PARTIAL === "true";

const REQUEST_TIMEOUT_MS = Number(process.env.PHASE8_REQUEST_TIMEOUT_MS ?? 15000);

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
  if (status === "PASS") return color(status, ANSI.green);
  if (status === "FAIL") return color(status, ANSI.red);
  return color(status, ANSI.yellow);
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
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
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

  throw new Error(`No se pudo iniciar sesion admin para fase 8. ${lastError}`);
}

async function ensureCustomer(adminCookie) {
  const list = await requestJson("/api/customers", {
    headers: headersFromCookie(adminCookie),
  });

  if (list.ok && Array.isArray(list.json) && list.json.length > 0) {
    return list.json[0].id;
  }

  const suffix = randomSuffix();
  const createPayload = {
    nombres: "Fase8",
    apellidos: `QA-${suffix}`,
    email: `fase8-${suffix}@example.com`,
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

  return created.json.id;
}

function buildFabricPayload() {
  const suffix = randomSuffix();
  return {
    code: `PHASE8-FAB-${suffix}`,
    nombre: `Tela Fase 8 ${suffix}`,
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
      return activeFabric.id;
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

  return created.json.id;
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
    notes: "Orden de validacion Fase 8",
    internalNotes: "QA - payments",
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

function buildPaymentPayload(amount, overrides = {}) {
  return {
    amount,
    method: "YAPE",
    concept: "ADELANTO",
    status: "APROBADO",
    provider: "YAPE",
    operationCode: `PH8-OP-${randomSuffix()}`,
    approvalCode: `PH8-APR-${randomSuffix()}`,
    paidAt: new Date().toISOString(),
    notes: "Pago validacion fase 8",
    ...overrides,
  };
}

function buildComprobantePayload(total, overrides = {}) {
  return {
    type: "BOLETA",
    status: "EMITIDO",
    serie: "B001",
    numero: randomSuffix().slice(-6),
    subtotal: Number((total / 1.18).toFixed(2)),
    impuesto: Number((total - total / 1.18).toFixed(2)),
    total,
    issuedAt: new Date().toISOString(),
    notes: "Comprobante validacion fase 8",
    ...overrides,
  };
}

async function run() {
  await waitForServer();

  const results = [];
  let adminCookie = ADMIN_COOKIE;

  console.log("");
  console.log(color("Fase 8 - Payments + Comprobantes", ANSI.cyan));
  console.log(color(`Base URL: ${BASE_URL}`, ANSI.dim));
  console.log(
    color(
      `Cookie admin=${adminCookie ? "yes" : "no"} partial=${ALLOW_PARTIAL ? "yes" : "no"}`,
      ANSI.dim
    )
  );

  const fakeId = "00000000-0000-0000-0000-000000000000";

  const unauthorizedPayments = await requestJson(`/api/custom-orders/${fakeId}/payments`);
  recordCheck(
    results,
    "GET /api/custom-orders/:id/payments sin cookie bloquea acceso",
    unauthorizedPayments.status === 401 ? "PASS" : "FAIL",
    unauthorizedPayments.status === 401
      ? "401 as expected"
      : `Expected 401, got ${unauthorizedPayments.status}`
  );

  const unauthorizedComprobantes = await requestJson(
    `/api/custom-orders/${fakeId}/comprobantes`
  );
  recordCheck(
    results,
    "GET /api/custom-orders/:id/comprobantes sin cookie bloquea acceso",
    unauthorizedComprobantes.status === 401 ? "PASS" : "FAIL",
    unauthorizedComprobantes.status === 401
      ? "401 as expected"
      : `Expected 401, got ${unauthorizedComprobantes.status}`
  );

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
      recordCheck(results, "Flujo fase 8 con admin", "SKIP", "No admin cookie configured");
    } else {
      recordCheck(results, "Flujo fase 8 con admin", "FAIL", "No admin cookie configured");
    }
  } else {
    const adminHeaders = {
      ...headersFromCookie(adminCookie),
      "content-type": "application/json",
    };

    let customerId = null;
    let fabricId = null;

    try {
      customerId = await ensureCustomer(adminCookie);
      fabricId = await ensureFabric(adminCookie);
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
          "POST /api/custom-orders crea orden base para fase 8",
          "FAIL",
          `Expected 201, got ${createOrder.status}`
        );
      } else {
        const orderId = createOrder.json.id;
        const orderTotal = toNumber(createOrder.json.total);

        recordCheck(
          results,
          "POST /api/custom-orders crea orden base para fase 8",
          "PASS",
          `order=${orderId} total=${orderTotal}`
        );

        const firstApprovedPayment = await requestJson(
          `/api/custom-orders/${orderId}/payments`,
          {
            method: "POST",
            headers: adminHeaders,
            body: buildPaymentPayload(250),
          }
        );

        if (
          firstApprovedPayment.ok &&
          firstApprovedPayment.json?.payment?.status === "APROBADO"
        ) {
          recordCheck(
            results,
            "POST pago APROBADO crea pago y resumen",
            "PASS",
            `payment=${firstApprovedPayment.json.payment.id}`
          );
        } else {
          recordCheck(
            results,
            "POST pago APROBADO crea pago y resumen",
            "FAIL",
            `Expected 201, got ${firstApprovedPayment.status}`
          );
        }

        const pendingLargePayment = await requestJson(
          `/api/custom-orders/${orderId}/payments`,
          {
            method: "POST",
            headers: adminHeaders,
            body: buildPaymentPayload(9_999, {
              status: "PENDIENTE",
              method: "TRANSFERENCIA",
              provider: "BANCO",
              concept: "SALDO",
            }),
          }
        );

        if (
          pendingLargePayment.ok &&
          pendingLargePayment.json?.payment?.status === "PENDIENTE"
        ) {
          recordCheck(
            results,
            "POST pago PENDIENTE no bloquea por sobrepago aprobado",
            "PASS",
            "Pago pendiente registrado"
          );
        } else {
          recordCheck(
            results,
            "POST pago PENDIENTE no bloquea por sobrepago aprobado",
            "FAIL",
            `Expected 201, got ${pendingLargePayment.status}`
          );
        }

        const paymentList = await requestJson(`/api/custom-orders/${orderId}/payments`, {
          headers: headersFromCookie(adminCookie),
        });
        const approvedTotal = toNumber(paymentList.json?.summary?.approvedPaymentsTotal);
        const pendingBalance = toNumber(paymentList.json?.summary?.pendingBalance);
        const expectedPendingBalance = orderTotal - 250;

        if (
          paymentList.ok &&
          Math.abs(approvedTotal - 250) < 0.01 &&
          Math.abs(pendingBalance - expectedPendingBalance) < 0.01
        ) {
          recordCheck(
            results,
            "GET pagos resume solo pagos aprobados",
            "PASS",
            `approved=${approvedTotal} pending=${pendingBalance}`
          );
        } else {
          recordCheck(
            results,
            "GET pagos resume solo pagos aprobados",
            "FAIL",
            `summary invalid status=${paymentList.status}`
          );
        }

        const approvedFilter = await requestJson(
          `/api/custom-orders/${orderId}/payments?status=APROBADO`,
          { headers: headersFromCookie(adminCookie) }
        );

        const onlyApproved =
          approvedFilter.ok &&
          Array.isArray(approvedFilter.json?.payments) &&
          approvedFilter.json.payments.length >= 1 &&
          approvedFilter.json.payments.every((payment) => payment.status === "APROBADO");

        recordCheck(
          results,
          "GET pagos filtra por status=APROBADO",
          onlyApproved ? "PASS" : "FAIL",
          onlyApproved
            ? `count=${approvedFilter.json.payments.length}`
            : `Unexpected response status=${approvedFilter.status}`
        );

        const overchargeApproved = await requestJson(
          `/api/custom-orders/${orderId}/payments`,
          {
            method: "POST",
            headers: adminHeaders,
            body: buildPaymentPayload(orderTotal),
          }
        );

        recordCheck(
          results,
          "POST pago APROBADO sobrepasa total bloqueado",
          overchargeApproved.status === 409 ? "PASS" : "FAIL",
          overchargeApproved.status === 409
            ? "409 as expected"
            : `Expected 409, got ${overchargeApproved.status}`
        );

        const validComprobante = await requestJson(
          `/api/custom-orders/${orderId}/comprobantes`,
          {
            method: "POST",
            headers: adminHeaders,
            body: buildComprobantePayload(300),
          }
        );

        if (validComprobante.ok && validComprobante.json?.status === "EMITIDO") {
          recordCheck(
            results,
            "POST comprobante valido registrado",
            "PASS",
            `comprobante=${validComprobante.json.id}`
          );
        } else {
          recordCheck(
            results,
            "POST comprobante valido registrado",
            "FAIL",
            `Expected 201, got ${validComprobante.status}`
          );
        }

        const comprobanteFilter = await requestJson(
          `/api/custom-orders/${orderId}/comprobantes?status=EMITIDO`,
          { headers: headersFromCookie(adminCookie) }
        );

        const onlyIssued =
          comprobanteFilter.ok &&
          Array.isArray(comprobanteFilter.json) &&
          comprobanteFilter.json.length >= 1 &&
          comprobanteFilter.json.every((item) => item.status === "EMITIDO");

        recordCheck(
          results,
          "GET comprobantes filtra por status=EMITIDO",
          onlyIssued ? "PASS" : "FAIL",
          onlyIssued
            ? `count=${comprobanteFilter.json.length}`
            : `Unexpected response status=${comprobanteFilter.status}`
        );

        const overchargeComprobante = await requestJson(
          `/api/custom-orders/${orderId}/comprobantes`,
          {
            method: "POST",
            headers: adminHeaders,
            body: buildComprobantePayload(orderTotal + 1),
          }
        );

        recordCheck(
          results,
          "POST comprobante sobrepasa total bloqueado",
          overchargeComprobante.status === 409 ? "PASS" : "FAIL",
          overchargeComprobante.status === 409
            ? "409 as expected"
            : `Expected 409, got ${overchargeComprobante.status}`
        );
      }
    }
  }

  console.log("");
  console.log("Reporte de Fase 8");
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
  console.error(
    color(`Error: ${error instanceof Error ? error.message : String(error)}`, ANSI.red)
  );
  process.exitCode = 1;
});
