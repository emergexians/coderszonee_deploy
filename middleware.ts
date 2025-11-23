// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = process.env.JWT_SECRET;

async function verifyJWT(token: string) {
  if (!SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET));
    // payload can include userId, email, role if you signed them
    return payload as { userId?: string; email?: string; role?: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const payload = token ? await verifyJWT(token) : null;
  const authed = !!payload?.userId;

  // ---- Protect app areas that require login ----
  const isProtected =
    pathname.startsWith("/student") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/admin");

  if (isProtected && !authed) {
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // ---- Optional: simple role gates (uncomment if you sign `role` in JWT) ----
  // if (pathname.startsWith("/student") && payload?.role && payload.role !== "student") {
  //   return NextResponse.redirect(new URL("/403", req.url));
  // }
  // if (pathname.startsWith("/instructor") && payload?.role && payload.role !== "instructor") {
  //   return NextResponse.redirect(new URL("/403", req.url));
  // }
  // if (pathname.startsWith("/admin") && payload?.role && payload.role !== "admin") {
  //   return NextResponse.redirect(new URL("/403", req.url));
  // }

  // ---- Auth routes behavior ----
  if (pathname.startsWith("/auth")) {
    // Always allow logout to clear cookie
    if (pathname === "/auth/logout") return NextResponse.next();

    // If already logged in, keep them out of signin/signup
    if (authed) {
      // Send them to a sensible default
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on the routes we care about
  matcher: [
    "/student/:path*",
    "/instructor/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
