import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const { pathname } = request.nextUrl;
  const isPublicRoute = pathname === "/login";
  const isFrameworkAsset = pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico");
  const hasSessionCookie = Boolean(accessToken || refreshToken);

  if (isFrameworkAsset) {
    return NextResponse.next();
  }

  if (!hasSessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};