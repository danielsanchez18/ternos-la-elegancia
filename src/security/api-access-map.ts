import { ApiAuthLevel } from "@/lib/api-auth";

export type RouteAccessPolicy = {
  pattern: string;
  level: ApiAuthLevel | "public";
};

export const apiAccessPolicies: RouteAccessPolicy[] = [
  { pattern: "/api/auth/**", level: "public" },
  { pattern: "/api/internal/cron/**", level: "public" },

  { pattern: "/api/products", level: "public" },
  { pattern: "/api/products/[id]", level: "public" },
  { pattern: "/api/products/slug/[slug]", level: "public" },
  { pattern: "/api/payments/izipay/session-token", level: "authenticated" },
  { pattern: "/api/orders/[orderType]/[orderId]/available-coupons", level: "authenticated" },
  { pattern: "/api/brands/**", level: "admin" },
  { pattern: "/api/bundles", level: "public" },

  { pattern: "/api/customers/[id]/notes", level: "admin" },
  { pattern: "/api/customers/notes/[noteId]", level: "admin" },
  { pattern: "/api/customers/[id]/files", level: "admin" },
  { pattern: "/api/customers/files/[fileId]", level: "admin" },

  { pattern: "/api/reports/**", level: "admin" },
  { pattern: "/api/promotions/**", level: "admin" },
  { pattern: "/api/coupons/**", level: "admin" },
  { pattern: "/api/sale-orders/**", level: "admin" },
  { pattern: "/api/custom-orders/**", level: "admin" },
  { pattern: "/api/rental-orders/**", level: "admin" },
  { pattern: "/api/alteration-orders/**", level: "admin" },
  { pattern: "/api/rental-units/**", level: "admin" },
  { pattern: "/api/appointments/**", level: "admin" },
  { pattern: "/api/notifications/**", level: "admin" },
  { pattern: "/api/alteration-services/**", level: "admin" },
  { pattern: "/api/catalog/**", level: "admin" },
  { pattern: "/api/measurement-profiles/**", level: "admin" },
  { pattern: "/api/measurement-fields/**", level: "admin" },
  { pattern: "/api/fabrics/**", level: "admin" },
  { pattern: "/api/users/**", level: "admin" },
  { pattern: "/api/customers/**", level: "admin" },
];
