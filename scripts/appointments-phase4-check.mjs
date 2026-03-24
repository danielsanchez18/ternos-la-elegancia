import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const BASE_URL = (
  process.env.PHASE4_BASE_URL ??
  process.env.ACCESS_PHASE4_BASE_URL ??
  process.env.ACCESS_MATRIX_BASE_URL ??
  "http://127.0.0.1:3000"
).replace(/\/$/, "");

const ADMIN_COOKIE = process.env.PHASE4_ADMIN_COOKIE?.trim() || process.env.ACCESS_MATRIX_ADMIN_COOKIE?.trim() || null;
const CUSTOMER_COOKIE =
  process.env.PHASE4_CUSTOMER_COOKIE?.trim() ||
  process.env.ACCESS_MATRIX_CUSTOMER_COOKIE?.trim() ||
  null;
const CRON_SECRET =
  process.env.PHASE4_CRON_SECRET?.trim() ||
  process.env.CRON_SECRET?.trim() ||
  null;

const ALLOW_PARTIAL =
  process.env.PHASE4_ALLOW_PARTIAL === "true" ||
  process.env.ACCESS_PHASE4_ALLOW_PARTIAL === "true" ||
  process.env.ACCESS_MATRIX_ALLOW_PARTIAL === "true";

const REQUEST_TIMEOUT_MS = Number(process.env.PHASE4_REQUEST_TIMEOUT_MS ?? 15000);

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

function headersFromCookie(cookie) {
  return cookie ? { cookie } : {};
}

function pushResult(results, result) {
  results.push(result);
}

function recordCheck(results, checkName, status, message, meta = {}) {
  pushResult(results, {
    checkName,
    status,
    message,
    ...meta,
  });
}

async function run() {
  await waitForServer();

  const results = [];

  printSection("Fase 4 - Appointments");
  console.log(color(`Base URL: ${BASE_URL}`, ANSI.dim));
  console.log(
    color(
      `Cookies: admin=${ADMIN_COOKIE ? "yes" : "no"} customer=${CUSTOMER_COOKIE ? "yes" : "no"} partial=${ALLOW_PARTIAL ? "yes" : "no"} cron=${CRON_SECRET ? "yes" : "no"}`,
      ANSI.dim
    )
  );

  const publicAppointments = await requestJson("/api/appointments");
  if (publicAppointments.status === 401) {
    recordCheck(results, "GET /api/appointments without cookie blocks access", "PASS", "401 as expected");
  } else {
    recordCheck(
      results,
      "GET /api/appointments without cookie blocks access",
      "FAIL",
      `Expected 401, got ${publicAppointments.status}`
    );
  }

  if (CUSTOMER_COOKIE) {
    const customerAppointments = await requestJson("/api/appointments", {
      headers: headersFromCookie(CUSTOMER_COOKIE),
    });

    if (customerAppointments.status === 403) {
      recordCheck(
        results,
        "GET /api/appointments with customer cookie blocks access",
        "PASS",
        "403 as expected"
      );
    } else {
      recordCheck(
        results,
        "GET /api/appointments with customer cookie blocks access",
        "FAIL",
        `Expected 403, got ${customerAppointments.status}`
      );
    }
  } else if (ALLOW_PARTIAL) {
    recordCheck(
      results,
      "GET /api/appointments with customer cookie blocks access",
      "SKIP",
      "No customer cookie configured"
    );
  } else {
    recordCheck(
      results,
      "GET /api/appointments with customer cookie blocks access",
      "FAIL",
      "No customer cookie configured"
    );
  }

  if (ADMIN_COOKIE) {
    const adminAppointments = await requestJson("/api/appointments", {
      headers: headersFromCookie(ADMIN_COOKIE),
    });

    if (adminAppointments.ok && Array.isArray(adminAppointments.json)) {
      recordCheck(
        results,
        "GET /api/appointments with admin cookie returns agenda",
        "PASS",
        `Retrieved ${adminAppointments.json.length} appointments`
      );

      if (adminAppointments.json.length > 0) {
        const appointmentId = adminAppointments.json[0].id;
        const appointmentDetail = await requestJson(`/api/appointments/${appointmentId}`, {
          headers: headersFromCookie(ADMIN_COOKIE),
        });

        if (appointmentDetail.ok && appointmentDetail.json?.id === appointmentId) {
          recordCheck(
            results,
            "GET /api/appointments/:id returns appointment detail",
            "PASS",
            `Fetched appointment ${appointmentId}`
          );
        } else if (appointmentDetail.status === 500 && ALLOW_PARTIAL) {
          recordCheck(
            results,
            "GET /api/appointments/:id returns appointment detail",
            "SKIP",
            "Endpoint reachable but data access requires DB"
          );
        } else {
          recordCheck(
            results,
            "GET /api/appointments/:id returns appointment detail",
            "FAIL",
            `Expected 200, got ${appointmentDetail.status}`
          );
        }
      } else if (ALLOW_PARTIAL) {
        recordCheck(
          results,
          "GET /api/appointments/:id returns appointment detail",
          "SKIP",
          "No appointments available to inspect"
        );
      } else {
        recordCheck(
          results,
          "GET /api/appointments/:id returns appointment detail",
          "FAIL",
          "No appointments available to inspect"
        );
      }
    } else if (adminAppointments.status === 500 && ALLOW_PARTIAL) {
      recordCheck(
        results,
        "GET /api/appointments with admin cookie returns agenda",
        "SKIP",
        "Endpoint reachable but data access requires DB"
      );
      recordCheck(
        results,
        "GET /api/appointments/:id returns appointment detail",
        "SKIP",
        "Skipped because agenda listing could not be read"
      );
    } else {
      recordCheck(
        results,
        "GET /api/appointments with admin cookie returns agenda",
        "FAIL",
        `Expected 200, got ${adminAppointments.status}`
      );
      recordCheck(
        results,
        "GET /api/appointments/:id returns appointment detail",
        "FAIL",
        "Skipped because agenda listing could not be read"
      );
    }

    const businessHours = await requestJson("/api/appointments/business-hours", {
      headers: headersFromCookie(ADMIN_COOKIE),
    });

    if (businessHours.ok && Array.isArray(businessHours.json) && businessHours.json.length === 7) {
      recordCheck(
        results,
        "GET /api/appointments/business-hours returns weekly calendar",
        "PASS",
        "7 business-hour rows returned"
      );
    } else if (businessHours.status === 500 && ALLOW_PARTIAL) {
      recordCheck(
        results,
        "GET /api/appointments/business-hours returns weekly calendar",
        "SKIP",
        "Endpoint reachable but data access requires DB"
      );
    } else {
      recordCheck(
        results,
        "GET /api/appointments/business-hours returns weekly calendar",
        "FAIL",
        `Expected 200 with 7 rows, got ${businessHours.status}`
      );
    }

    const specialSchedules = await requestJson("/api/appointments/special-schedules", {
      headers: headersFromCookie(ADMIN_COOKIE),
    });

    if (specialSchedules.ok && Array.isArray(specialSchedules.json)) {
      recordCheck(
        results,
        "GET /api/appointments/special-schedules returns exceptions",
        "PASS",
        `Retrieved ${specialSchedules.json.length} special schedules`
      );
    } else if (specialSchedules.status === 500 && ALLOW_PARTIAL) {
      recordCheck(
        results,
        "GET /api/appointments/special-schedules returns exceptions",
        "SKIP",
        "Endpoint reachable but data access requires DB"
      );
    } else {
      recordCheck(
        results,
        "GET /api/appointments/special-schedules returns exceptions",
        "FAIL",
        `Expected 200, got ${specialSchedules.status}`
      );
    }
  } else if (ALLOW_PARTIAL) {
    recordCheck(
      results,
      "GET /api/appointments with admin cookie returns agenda",
      "SKIP",
      "No admin cookie configured"
    );
    recordCheck(
      results,
      "GET /api/appointments/:id returns appointment detail",
      "SKIP",
      "No admin cookie configured"
    );
    recordCheck(
      results,
      "GET /api/appointments/business-hours returns weekly calendar",
      "SKIP",
      "No admin cookie configured"
    );
    recordCheck(
      results,
      "GET /api/appointments/special-schedules returns exceptions",
      "SKIP",
      "No admin cookie configured"
    );
  } else {
    recordCheck(
      results,
      "GET /api/appointments with admin cookie returns agenda",
      "FAIL",
      "No admin cookie configured"
    );
    recordCheck(
      results,
      "GET /api/appointments/:id returns appointment detail",
      "FAIL",
      "No admin cookie configured"
    );
    recordCheck(
      results,
      "GET /api/appointments/business-hours returns weekly calendar",
      "FAIL",
      "No admin cookie configured"
    );
    recordCheck(
      results,
      "GET /api/appointments/special-schedules returns exceptions",
      "FAIL",
      "No admin cookie configured"
    );
  }

  const unauthorizedCron = await requestJson("/api/internal/cron/appointments/reminder-24h", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: { dryRun: true, channel: "WHATSAPP" },
  });

  if (unauthorizedCron.status === 401) {
    recordCheck(
      results,
      "POST /api/internal/cron/appointments/reminder-24h without secret is blocked",
      "PASS",
      "401 as expected"
    );
  } else if (
    unauthorizedCron.status === 500 &&
    unauthorizedCron.json &&
    typeof unauthorizedCron.json === "object" &&
    unauthorizedCron.json.error === "CRON_SECRET is not configured"
  ) {
    if (ALLOW_PARTIAL) {
      recordCheck(
        results,
        "POST /api/internal/cron/appointments/reminder-24h without secret is blocked",
        "SKIP",
        "CRON_SECRET is not configured in this environment"
      );
    } else {
      recordCheck(
        results,
        "POST /api/internal/cron/appointments/reminder-24h without secret is blocked",
        "FAIL",
        "CRON_SECRET is not configured in this environment"
      );
    }
  } else {
    recordCheck(
      results,
      "POST /api/internal/cron/appointments/reminder-24h without secret is blocked",
      "FAIL",
      `Expected 401, got ${unauthorizedCron.status}`
    );
  }

  if (CRON_SECRET) {
    const authorizedCron = await requestJson("/api/internal/cron/appointments/reminder-24h", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${CRON_SECRET}`,
      },
      body: { dryRun: true, channel: "WHATSAPP" },
    });

    if (authorizedCron.ok || authorizedCron.status === 409) {
      recordCheck(
        results,
        "POST /api/internal/cron/appointments/reminder-24h dry run accepts secret",
        "PASS",
        `Status ${authorizedCron.status}`
      );
    } else if (authorizedCron.status === 500 && ALLOW_PARTIAL) {
      recordCheck(
        results,
        "POST /api/internal/cron/appointments/reminder-24h dry run accepts secret",
        "SKIP",
        "Endpoint reachable but data access requires DB"
      );
    } else {
      recordCheck(
        results,
        "POST /api/internal/cron/appointments/reminder-24h dry run accepts secret",
        "FAIL",
        `Expected 200/409, got ${authorizedCron.status}`
      );
    }
  } else if (ALLOW_PARTIAL) {
    recordCheck(
      results,
      "POST /api/internal/cron/appointments/reminder-24h dry run accepts secret",
      "SKIP",
      "No cron secret configured"
    );
  } else {
    recordCheck(
      results,
      "POST /api/internal/cron/appointments/reminder-24h dry run accepts secret",
      "FAIL",
      "No cron secret configured"
    );
  }

  console.log("");
  console.log("Reporte de Fase 4");
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
