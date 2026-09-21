import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isProtectedRoute =
    pathname.startsWith("/chat") || pathname.startsWith("/settings");

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/chat/new", req.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/settings/:path*", "/sign-in", "/sign-up"],
};
