import { headers } from "next/headers";
import { getAdminDashboardMetrics } from "@/lib/admin-dashboard-metrics";
import {
  getAdminCustomersListData,
  getAdminCustomersOverviewData,
} from "@/lib/admin-customers";

export type AdminDashboardMetrics = {
  totalCustomers: number;
  newCustomersThisMonth: number;
  todayAppointments: number;
  upcomingWeekAppointments: number;
  noShowThisMonth: number;
  openOrders: {
    sale: number;
    custom: number;
    rental: number;
    alteration: number;
    total: number;
  };
  revenue: {
    approvedThirtyDaysAmount: number;
    approvedThirtyDaysCount: number;
    pendingAmount: number;
    pendingCount: number;
  };
  inventory: {
    lowStockVariants: number;
    lowStockFabrics: number;
    busyRentalUnits: number;
    maintenanceRentalUnits: number;
  };
  communications: {
    failuresThirtyDays: number;
    pendingNotifications: number;
  };
  recentAppointments: Array<{
    id: number;
    code: string;
    type: string;
    status: string;
    scheduledAt: string;
    customerName: string;
  }>;
  recentPayments: Array<{
    id: number;
    amount: number;
    status: string;
    method: string;
    paidAt: string;
    customerName: string;
  }>;
  generatedAt: string;
};

export type AdminCustomersOverview = {
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    newCustomersThisMonth: number;
    customersWithValidMeasurements: number;
    customersWithoutValidMeasurements: number;
    totalNotes: number;
    totalFiles: number;
    pendingNotifications: number;
  };
  recentCustomers: Array<{
    id: number;
    fullName: string;
    email: string;
    celular: string | null;
    dni: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    orderCount: number;
    appointmentCount: number;
    measurementProfileCount: number;
    notesCount: number;
    filesCount: number;
    notificationsCount: number;
    validMeasurementUntil: string | null;
    nextAppointmentAt: string | null;
    nextAppointmentStatus: string | null;
  }>;
  upcomingAppointments: Array<{
    id: number;
    code: string;
    type: string;
    status: string;
    scheduledAt: string;
    customerName: string;
  }>;
};

export type AdminCustomersList = Array<{
  id: number;
  fullName: string;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string | null;
  dni: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  appointmentCount: number;
  profileCount: number;
  notesCount: number;
  filesCount: number;
  validMeasurementUntil: string | null;
  lastAppointmentAt: string | null;
  lastAppointmentStatus: string | null;
}>;

class AdminApiError extends Error {
  constructor(public readonly status: number) {
    super(`Admin API request failed with status ${status}`);
    this.name = "AdminApiError";
  }
}

type AdminFallbackTask<T> = {
  path: string;
  successLogMessage: string;
  fallbackLogMessage: (status: number) => string;
  fallback: () => Promise<T>;
};

function logDev(message: string) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[admin-api] ${message}`);
  }
}

function fallbackBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function resolveBaseUrl() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");

  if (!host) {
    return fallbackBaseUrl();
  }

  return `${protocol}://${host}`;
}

function isAuthFallbackError(error: unknown): error is AdminApiError {
  return error instanceof AdminApiError && (error.status === 401 || error.status === 403);
}

async function getWithAuthFallback<T>(task: AdminFallbackTask<T>): Promise<T> {
  try {
    const data = await getAuthenticatedJson<T>(task.path);
    logDev(task.successLogMessage);
    return data;
  } catch (error: unknown) {
    if (!isAuthFallbackError(error)) {
      throw error;
    }

    logDev(task.fallbackLogMessage(error.status));
    return task.fallback();
  }
}

export async function getAdminDashboardMetricsFromApi(): Promise<AdminDashboardMetrics> {
  return getWithAuthFallback<AdminDashboardMetrics>({
    path: "/api/admin/dashboard/metrics",
    successLogMessage: "dashboard metrics served via /api/admin/dashboard/metrics",
    fallbackLogMessage: (status) =>
      `dashboard metrics fallback activated (status=${status})`,
    fallback: async () => (await getAdminDashboardMetrics()) as unknown as AdminDashboardMetrics,
  });
}

export async function getAdminCustomersOverviewFromApi(): Promise<AdminCustomersOverview> {
  return getWithAuthFallback<AdminCustomersOverview>({
    path: "/api/admin/customers/overview",
    successLogMessage: "customers overview served via /api/admin/customers/overview",
    fallbackLogMessage: (status) =>
      `customers overview fallback activated (status=${status})`,
    fallback: async () =>
      (await getAdminCustomersOverviewData()) as unknown as AdminCustomersOverview,
  });
}

export async function getAdminCustomersListFromApi(): Promise<AdminCustomersList> {
  return getWithAuthFallback<AdminCustomersList>({
    path: "/api/admin/customers/list",
    successLogMessage: "customers list served via /api/admin/customers/list",
    fallbackLogMessage: (status) => `customers list fallback activated (status=${status})`,
    fallback: async () => (await getAdminCustomersListData()) as unknown as AdminCustomersList,
  });
}

async function getAuthenticatedJson<T>(path: string): Promise<T> {
  const requestHeaders = await headers();
  const baseUrl = await resolveBaseUrl();
  const forwardedHeaders = new Headers(requestHeaders);
  forwardedHeaders.set("accept", "application/json");

  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    cache: "no-store",
    headers: forwardedHeaders,
  });

  if (!response.ok) {
    throw new AdminApiError(response.status);
  }

  return (await response.json()) as T;
}
