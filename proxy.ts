import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getRouteAccessPolicy } from "./src/security/api-access-map";

const SESSION_COOKIE_NAMES = [
  "session_token",
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

function hasSessionCookie(request: NextRequest): boolean {
  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name);

  return cookieNames.some((name) => {
    if (SESSION_COOKIE_NAMES.includes(name)) {
      return true;
    }

    return (
      name.endsWith(".session_token") ||
      name.endsWith("-session_token") ||
      name.includes("session_token")
    );
  });
}

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const policy = getRouteAccessPolicy(pathname);

    if (!policy || policy.level === "public") {
      return NextResponse.next();
    }

    if (!hasSessionCookie(request)) {
      return unauthorizedResponse();
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (hasSessionCookie(request)) {
      return NextResponse.next();
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/ingresa";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
