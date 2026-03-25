import type { ApiAuthLevel } from "@/lib/api-auth";

export type RouteAccessPolicy = {
  pattern: string;
  level: ApiAuthLevel | "public";
};

export const apiAccessPolicies: RouteAccessPolicy[] = [
  { pattern: "/api/auth/**", level: "public" },
  { pattern: "/api/internal/cron/**", level: "public" },
  { pattern: "/api/session-access", level: "public" },

  { pattern: "/api/products/**", level: "public" },
  { pattern: "/api/bundles/**", level: "public" },

  { pattern: "/api/payments/izipay/session-token", level: "authenticated" },
  { pattern: "/api/orders/[orderType]/[orderId]/available-coupons", level: "authenticated" },
  { pattern: "/api/customers/bootstrap", level: "authenticated" },

  { pattern: "/api/admin/**", level: "admin" },
  { pattern: "/api/brands/**", level: "admin" },
  { pattern: "/api/users/**", level: "admin" },
  { pattern: "/api/customers/**", level: "authenticated" },
  { pattern: "/api/fabrics/**", level: "admin" },
  { pattern: "/api/measurement-fields/**", level: "admin" },
  { pattern: "/api/measurement-profiles/**", level: "authenticated" },
  { pattern: "/api/appointments/**", level: "authenticated" },
  { pattern: "/api/notifications/**", level: "admin" },

  { pattern: "/api/coupons/**", level: "admin" },
  { pattern: "/api/promotions/**", level: "admin" },
  { pattern: "/api/reports/**", level: "admin" },

  { pattern: "/api/catalog/**", level: "admin" },
  { pattern: "/api/alteration-services/**", level: "admin" },
  { pattern: "/api/sale-orders/**", level: "admin" },
  { pattern: "/api/custom-orders/**", level: "authenticated" },
  { pattern: "/api/rental-orders/**", level: "authenticated" },
  { pattern: "/api/alteration-orders/**", level: "admin" },
  { pattern: "/api/rental-units/**", level: "admin" },
];

type CompiledRoutePolicy = RouteAccessPolicy & {
  matcher: RegExp;
};

const compiledPolicies: CompiledRoutePolicy[] = apiAccessPolicies.map((policy) => ({
  ...policy,
  matcher: compileRoutePattern(policy.pattern),
}));

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePathname(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function compileRoutePattern(pattern: string): RegExp {
  const normalizedPattern = normalizePathname(pattern);
  let source = escapeRegExp(normalizedPattern);

  // Catch-all segments like `[...all]`.
  source = source.replace(/\\\[\\.\\.\\.[^\]]+\\\]/g, ".+");
  // Dynamic segments like `[id]`.
  source = source.replace(/\\\[[^\]]+\\\]/g, "[^/]+");
  // Recursive wildcard.
  source = source.replace(/\/\\\*\\\*$/g, "(?:/.*)?");
  source = source.replace(/\\\*\\\*/g, ".*");

  return new RegExp(`^${source}/?$`);
}

export function getRouteAccessPolicy(pathname: string): RouteAccessPolicy | null {
  const normalizedPathname = normalizePathname(pathname);

  for (const policy of compiledPolicies) {
    if (policy.matcher.test(normalizedPathname)) {
      return { pattern: policy.pattern, level: policy.level };
    }
  }

  return null;
}
