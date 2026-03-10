import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;
  const isPublicRoute = pathname === "/login";
  const isFrameworkAsset = pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico");

  if (isFrameworkAsset) {
    return NextResponse.next();
  }

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/users/:path*", "/ventas/:path*", "/category/:path*"],
};