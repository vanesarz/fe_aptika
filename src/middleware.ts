import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Define public paths
  const isPublicPath = pathname === "/login";
  
  // Static assets, public resources, and favicon bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  // If user is logged in, restrict access to /login or / and redirect to dashboard
  if (token && (isPublicPath || pathname === "/")) {
    return NextResponse.redirect(new URL("/rekayasaaplikasi/dashboard", request.url));
  }

  // If user is NOT logged in and path is protected, redirect to login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Otherwise, proceed
  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    "/",
    "/login",
    "/spd/:path*",
    "/rekayasaaplikasi/:path*",
    "/integrasiinteroperabilitas/:path*",
    "/smartjabar/:path*",
    "/sidebarjabar/:path*",
    "/sadajabar/:path*",
    "/pengelolaanaplikasi/:path*",
    "/manajementugasdigital/:path*",
    "/admin/:path*",
  ],
};
