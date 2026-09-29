import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname === "/api/admin" || pathname.startsWith("/api/admin/");
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const cookie = request.headers.get("cookie");
  if (!cookie) {
    if (isAdminApi) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    return NextResponse.redirect(new URL("/account", request.url));
  }

  const check = await fetch(new URL("/api/auth/me", request.url), {
    headers: { cookie },
    cache: "no-store",
  }).catch(() => null);
  const data = check ? await check.json().catch(() => null) : null;

  if (data?.user?.role === "ADMIN") return NextResponse.next();

  if (isAdminApi) {
    return NextResponse.json(
      { error: data?.user ? "Admin access required." : "Authentication required." },
      { status: data?.user ? 403 : 401 },
    );
  }

  return NextResponse.redirect(new URL("/account", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
