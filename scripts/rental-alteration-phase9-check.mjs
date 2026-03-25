import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const BASE_URL = (
  process.env.PHASE9_BASE_URL ??
  process.env.PHASE8_BASE_URL ??
  process.env.PHASE7_BASE_URL ??
  process.env.ACCESS_MATRIX_BASE_URL ??
  "http://127.0.0.1:3000"
).replace(/\/$/, "");

const ADMIN_COOKIE =
  process.env.PHASE9_ADMIN_COOKIE?.trim() ||
  process.env.PHASE8_ADMIN_COOKIE?.trim() ||
  process.env.PHASE7_ADMIN_COOKIE?.trim() ||
  process.env.ACCESS_MATRIX_ADMIN_COOKIE?.trim() ||
  null;

const ADMIN_EMAIL =
  process.env.PHASE9_ADMIN_EMAIL?.trim().toLowerCase() ||
  process.env.PHASE8_ADMIN_EMAIL?.trim().toLowerCase() ||
  process.env.PHASE7_ADMIN_EMAIL?.trim().toLowerCase() ||
  process.env.ACCESS_MATRIX_ADMIN_EMAIL?.trim().toLowerCase() ||
  "";

const ADMIN_PASSWORD =
  process.env.PHASE9_ADMIN_PASSWORD?.trim() ||
  process.env.PHASE8_ADMIN_PASSWORD?.trim() ||
  process.env.PHASE7_ADMIN_PASSWORD?.trim() ||
  process.env.ACCESS_MATRIX_ADMIN_PASSWORD?.trim() ||
  "";

const ALLOW_PARTIAL =
  process.env.PHASE9_ALLOW_PARTIAL === "true" ||
  process.env.PHASE8_ALLOW_PARTIAL === "true" ||
  process.env.PHASE7_ALLOW_PARTIAL === "true" ||
  process.env.ACCESS_MATRIX_ALLOW_PARTIAL === "true";

const REQUEST_TIMEOUT_MS = Number(process.env.PHASE9_REQUEST_TIMEOUT_MS ?? 15000);

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

function randomSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return NaN;
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

  throw new Error(`No se pudo iniciar sesion admin para fase 9. ${lastError}`);
}

async function ensureCustomer(adminCookie) {
  const list = await requestJson("/api/customers", {
    headers: headersFromCookie(adminCookie),
  });

  if (list.ok && Array.isArray(list.json) && list.json.length > 0) {
    return list.json[0].id;
  }

  const suffix = randomSuffix();
  const payload = {
    nombres: "Fase9",
    apellidos: `QA-${suffix}`,
    email: `fase9-${suffix}@example.com`,
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
    body: payload,
  });

  if (!created.ok || !created.json?.id) {
    throw new Error(`No se pudo obtener/crear cliente. Status: ${created.status}`);
  }

  return created.json.id;
}

async function ensureRentalCapableProduct(adminCookie) {
  const listRentalEnabled = await requestJson("/api/products?allowsRental=true&active=true");
  if (
    listRentalEnabled.ok &&
    Array.isArray(listRentalEnabled.json) &&
    listRentalEnabled.json.length > 0 &&
    listRentalEnabled.json[0]?.id
  ) {
    return listRentalEnabled.json[0].id;
  }

  const listActive = await requestJson("/api/products?active=true");
  if (
    listActive.ok &&
    Array.isArray(listActive.json) &&
    listActive.json.length > 0 &&
    listActive.json[0]?.id
  ) {
    const productId = listActive.json[0].id;
    const patch = await requestJson(`/api/products/${productId}`, {
      method: "PATCH",
      headers: {
        ...headersFromCookie(adminCookie),
        "content-type": "application/json",
      },
      body: {
        allowsRental: true,
      },
    });

    if (patch.ok && patch.json?.id) {
      return patch.json.id;
    }
  }

  const suffix = randomSuffix();
  const createPayload = {
    nombre: `Producto Alquiler Fase 9 ${suffix}`,
    slug: `fase9-rental-${suffix}`.toLowerCase(),
    kind: "TERNO",
    stockTrackingMode: "INDIVIDUAL",
    requiresMeasurement: false,
    allowsSale: false,
    allowsRental: true,
    allowsCustomization: false,
    isFeatured: false,
    isNew: false,
    active: true,
  };

  const created = await requestJson("/api/products", {
    method: "POST",
    headers: {
      ...headersFromCookie(adminCookie),
      "content-type": "application/json",
    },
    body: createPayload,
  });

  if (!created.ok || !created.json?.id) {
    throw new Error(`No se pudo obtener/crear producto para alquiler. Status: ${created.status}`);
  }

  return created.json.id;
}

async function createRentalUnit(adminCookie, productId) {
  const suffix = randomSuffix();
  const payload = {
    productId,
    internalCode: `PH9-RU-${suffix}`,
    sizeLabel: "M",
    color: "Azul",
    currentTier: "ESTRENO",
    normalPrice: 180,
    premierePrice: 260,
    status: "DISPONIBLE",
    notes: "Unidad QA Fase 9",
  };

  const created = await requestJson("/api/rental-units", {
    method: "POST",
    headers: {
      ...headersFromCookie(adminCookie),
      "content-type": "application/json",
    },
    body: payload,
  });

  if (!created.ok || !created.json?.id) {
    throw new Error(`No se pudo crear rental unit. Status: ${created.status}`);
  }

  return created.json;
}

async function createAlterationService(adminCookie) {
  const suffix = randomSuffix();
  const payload = {
    nombre: `Arreglo Fase 9 ${suffix}`,
    precioBase: 85,
    activo: true,
  };

  const created = await requestJson("/api/alteration-services", {
    method: "POST",
    headers: {
      ...headersFromCookie(adminCookie),
      "content-type": "application/json",
    },
    body: payload,
  });

  if (!created.ok || !created.json?.id) {
    throw new Error(`No se pudo crear servicio de arreglo. Status: ${created.status}`);
  }

  return created.json;
}

function buildRentalOrderPayload(customerId, rentalUnitId, dueBackAtIso) {
  return {
    customerId,
    dueBackAt: dueBackAtIso,
    notes: "Orden de alquiler de validacion Fase 9",
    items: [
      {
        rentalUnitId,
      },
    ],
  };
}

async function run() {
  await waitForServer();

  const results = [];
  let adminCookie = ADMIN_COOKIE;

  console.log("");
  console.log(color("Fase 9 - Rental + Alteration", ANSI.cyan));
  console.log(color(`Base URL: ${BASE_URL}`, ANSI.dim));
  console.log(
    color(
      `Cookie admin=${adminCookie ? "yes" : "no"} partial=${ALLOW_PARTIAL ? "yes" : "no"}`,
      ANSI.dim
    )
  );

  const unauthorizedRentalOrders = await requestJson("/api/rental-orders");
  recordCheck(
    results,
    "GET /api/rental-orders sin cookie bloquea acceso",
    unauthorizedRentalOrders.status === 401 ? "PASS" : "FAIL",
    unauthorizedRentalOrders.status === 401
      ? "401 as expected"
      : `Expected 401, got ${unauthorizedRentalOrders.status}`
  );

  const unauthorizedAlterationOrders = await requestJson("/api/alteration-orders");
  recordCheck(
    results,
    "GET /api/alteration-orders sin cookie bloquea acceso",
    unauthorizedAlterationOrders.status === 401 ? "PASS" : "FAIL",
    unauthorizedAlterationOrders.status === 401
      ? "401 as expected"
      : `Expected 401, got ${unauthorizedAlterationOrders.status}`
  );

  if (adminCookie) {
    const authProbe = await requestJson("/api/rental-orders", {
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
      recordCheck(results, "Flujo fase 9 con admin", "SKIP", "No admin cookie configured");
    } else {
      recordCheck(results, "Flujo fase 9 con admin", "FAIL", "No admin cookie configured");
    }
  } else {
    const adminHeaders = {
      ...headersFromCookie(adminCookie),
      "content-type": "application/json",
    };

    let customerId = null;
    let productId = null;
    let rentalUnit = null;

    try {
      customerId = await ensureCustomer(adminCookie);
      productId = await ensureRentalCapableProduct(adminCookie);
      rentalUnit = await createRentalUnit(adminCookie, productId);
      recordCheck(
        results,
        "Prerequisitos (customer/product/rental-unit) disponibles",
        "PASS",
        `customer=${customerId} product=${productId} unit=${rentalUnit.id}`
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      recordCheck(
        results,
        "Prerequisitos (customer/product/rental-unit) disponibles",
        "FAIL",
        detail
      );
    }

    if (customerId && rentalUnit?.id) {
      const dueBackAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

      const createRentalOrder = await requestJson("/api/rental-orders", {
        method: "POST",
        headers: adminHeaders,
        body: buildRentalOrderPayload(customerId, rentalUnit.id, dueBackAt),
      });

      if (!createRentalOrder.ok || !createRentalOrder.json?.id) {
        recordCheck(
          results,
          "POST /api/rental-orders crea orden inmediata",
          "FAIL",
          `Expected 201, got ${createRentalOrder.status}`
        );
      } else {
        const rentalOrderId = createRentalOrder.json.id;
        recordCheck(
          results,
          "POST /api/rental-orders crea orden inmediata",
          createRentalOrder.json.status === "ENTREGADO" ? "PASS" : "FAIL",
          `order=${rentalOrderId} status=${createRentalOrder.json.status}`
        );

        const unitAfterRent = await requestJson(`/api/rental-units/${rentalUnit.id}`, {
          headers: headersFromCookie(adminCookie),
        });
        recordCheck(
          results,
          "Unidad queda bloqueada al alquilar",
          unitAfterRent.ok && unitAfterRent.json?.status === "ALQUILADO" ? "PASS" : "FAIL",
          unitAfterRent.ok
            ? `status=${unitAfterRent.json?.status}`
            : `Expected 200, got ${unitAfterRent.status}`
        );

        const duplicateRentalAttempt = await requestJson("/api/rental-orders", {
          method: "POST",
          headers: adminHeaders,
          body: buildRentalOrderPayload(
            customerId,
            rentalUnit.id,
            new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
          ),
        });
        recordCheck(
          results,
          "No permite sobre-alquiler de la misma unidad",
          duplicateRentalAttempt.status === 409 ? "PASS" : "FAIL",
          duplicateRentalAttempt.status === 409
            ? "409 as expected"
            : `Expected 409, got ${duplicateRentalAttempt.status}`
        );

        const markReturned = await requestJson(`/api/rental-orders/${rentalOrderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: {
            action: "MARK_RETURNED",
            hasDamage: false,
            note: "Devolucion QA fase 9",
          },
        });
        recordCheck(
          results,
          "PATCH MARK_RETURNED registra devolucion",
          markReturned.ok && markReturned.json?.status === "DEVUELTO" ? "PASS" : "FAIL",
          markReturned.ok
            ? `status=${markReturned.json?.status}`
            : `Expected 200, got ${markReturned.status}`
        );

        const unitAfterReturn = await requestJson(`/api/rental-units/${rentalUnit.id}`, {
          headers: headersFromCookie(adminCookie),
        });
        const tierReturnedToNormal = unitAfterReturn.json?.currentTier === "NORMAL";
        recordCheck(
          results,
          "Unidad se libera y baja a tier NORMAL tras primer alquiler",
          unitAfterReturn.ok &&
            unitAfterReturn.json?.status === "DISPONIBLE" &&
            tierReturnedToNormal
            ? "PASS"
            : "FAIL",
          unitAfterReturn.ok
            ? `status=${unitAfterReturn.json?.status} tier=${unitAfterReturn.json?.currentTier}`
            : `Expected 200, got ${unitAfterReturn.status}`
        );

        const closeOrder = await requestJson(`/api/rental-orders/${rentalOrderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: {
            action: "CLOSE",
            note: "Cierre QA fase 9",
          },
        });
        recordCheck(
          results,
          "PATCH CLOSE cierra orden devuelta",
          closeOrder.ok && closeOrder.json?.status === "CERRADO" ? "PASS" : "FAIL",
          closeOrder.ok
            ? `status=${closeOrder.json?.status}`
            : `Expected 200, got ${closeOrder.status}`
        );
      }
    }

    let alterationService = null;
    try {
      alterationService = await createAlterationService(adminCookie);
      recordCheck(
        results,
        "POST /api/alteration-services crea servicio configurable",
        "PASS",
        `service=${alterationService.id}`
      );

      const patchService = await requestJson(`/api/alteration-services/${alterationService.id}`, {
        method: "PATCH",
        headers: adminHeaders,
        body: { precioBase: 95 },
      });

      recordCheck(
        results,
        "PATCH /api/alteration-services/:id actualiza precio",
        patchService.ok && toNumber(patchService.json?.precioBase) === 95 ? "PASS" : "FAIL",
        patchService.ok
          ? `precioBase=${patchService.json?.precioBase}`
          : `Expected 200, got ${patchService.status}`
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      recordCheck(
        results,
        "POST /api/alteration-services crea servicio configurable",
        "FAIL",
        detail
      );
    }

    if (customerId && alterationService?.id) {
      const promisedAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const createAlterationOrder = await requestJson("/api/alteration-orders", {
        method: "POST",
        headers: adminHeaders,
        body: {
          customerId,
          serviceId: alterationService.id,
          garmentDescription: "Pantalon vestir azul",
          workDescription: "Basta y ajuste de cintura",
          promisedAt,
          notes: "Orden de arreglo QA fase 9",
        },
      });

      if (!createAlterationOrder.ok || !createAlterationOrder.json?.id) {
        recordCheck(
          results,
          "POST /api/alteration-orders crea orden de arreglo",
          "FAIL",
          `Expected 201, got ${createAlterationOrder.status}`
        );
      } else {
        const alterationOrderId = createAlterationOrder.json.id;
        recordCheck(
          results,
          "POST /api/alteration-orders crea orden de arreglo",
          createAlterationOrder.json.status === "RECIBIDO" ? "PASS" : "FAIL",
          `order=${alterationOrderId} status=${createAlterationOrder.json.status}`
        );

        const invalidTransition = await requestJson(
          `/api/alteration-orders/${alterationOrderId}`,
          {
            method: "PATCH",
            headers: adminHeaders,
            body: { action: "MARK_READY", note: "Debe fallar" },
          }
        );
        recordCheck(
          results,
          "Transicion invalida de arreglo es bloqueada",
          invalidTransition.status === 409 ? "PASS" : "FAIL",
          invalidTransition.status === 409
            ? "409 as expected"
            : `Expected 409, got ${invalidTransition.status}`
        );

        const startEvaluation = await requestJson(`/api/alteration-orders/${alterationOrderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "START_EVALUATION", note: "Evaluando prenda" },
        });
        recordCheck(
          results,
          "START_EVALUATION cambia a EN_EVALUACION",
          startEvaluation.ok && startEvaluation.json?.status === "EN_EVALUACION"
            ? "PASS"
            : "FAIL",
          startEvaluation.ok
            ? `status=${startEvaluation.json?.status}`
            : `Expected 200, got ${startEvaluation.status}`
        );

        const startWork = await requestJson(`/api/alteration-orders/${alterationOrderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "START_WORK", note: "Inicia trabajo" },
        });
        recordCheck(
          results,
          "START_WORK cambia a EN_PROCESO",
          startWork.ok && startWork.json?.status === "EN_PROCESO" ? "PASS" : "FAIL",
          startWork.ok
            ? `status=${startWork.json?.status}`
            : `Expected 200, got ${startWork.status}`
        );

        const markReady = await requestJson(`/api/alteration-orders/${alterationOrderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "MARK_READY", note: "Trabajo terminado" },
        });
        recordCheck(
          results,
          "MARK_READY cambia a LISTO",
          markReady.ok && markReady.json?.status === "LISTO" ? "PASS" : "FAIL",
          markReady.ok
            ? `status=${markReady.json?.status}`
            : `Expected 200, got ${markReady.status}`
        );

        const markDelivered = await requestJson(`/api/alteration-orders/${alterationOrderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "MARK_DELIVERED", note: "Entregado al cliente" },
        });
        recordCheck(
          results,
          "MARK_DELIVERED cambia a ENTREGADO",
          markDelivered.ok &&
            markDelivered.json?.status === "ENTREGADO" &&
            Boolean(markDelivered.json?.deliveredAt)
            ? "PASS"
            : "FAIL",
          markDelivered.ok
            ? `status=${markDelivered.json?.status} deliveredAt=${markDelivered.json?.deliveredAt}`
            : `Expected 200, got ${markDelivered.status}`
        );

        const cancelDelivered = await requestJson(`/api/alteration-orders/${alterationOrderId}`, {
          method: "PATCH",
          headers: adminHeaders,
          body: { action: "CANCEL", note: "Debe fallar por entregado" },
        });
        recordCheck(
          results,
          "No permite CANCEL despues de ENTREGADO",
          cancelDelivered.status === 409 ? "PASS" : "FAIL",
          cancelDelivered.status === 409
            ? "409 as expected"
            : `Expected 409, got ${cancelDelivered.status}`
        );
      }

      const deactivateService = await requestJson(
        `/api/alteration-services/${alterationService.id}`,
        {
          method: "DELETE",
          headers: headersFromCookie(adminCookie),
        }
      );
      recordCheck(
        results,
        "DELETE /api/alteration-services/:id desactiva servicio",
        deactivateService.ok && deactivateService.json?.activo === false ? "PASS" : "FAIL",
        deactivateService.ok
          ? `activo=${deactivateService.json?.activo}`
          : `Expected 200, got ${deactivateService.status}`
      );
    }
  }

  console.log("");
  console.log("Reporte de Fase 9");
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
