import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";

const authPages = new Set(["/login", "/signup"]);

function buildRedirectTarget(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: new Headers(request.headers),
  });

  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthPage = authPages.has(pathname);

  if (!session && isDashboardRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", buildRedirectTarget(request));
    return NextResponse.redirect(loginUrl);
  }

  if (session && isAuthPage) {
    const destination = request.nextUrl.searchParams.get("redirectTo") || "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
  runtime: "nodejs",
};