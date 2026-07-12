import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// All routes that are inside the (dashboard) route group
const PROTECTED_PATHS = [
  "/dashboard",
  "/vehicles",
  "/drivers",
  "/trips",
  "/maintenance",
  "/expenses",
  "/analytics",
  "/settings",
  "/upgrade",
  "/admin/manage-access",
  "/admin/suspended-accounts",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtected && !token) {
    // Don't redirect the admin login page itself
    if (pathname === "/admin") {
      return NextResponse.next();
    }
    // Redirect to login if not authenticated
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vehicles/:path*",
    "/drivers/:path*",
    "/trips/:path*",
    "/maintenance/:path*",
    "/expenses/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/upgrade/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
