import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PRO_ROUTES = ["/dashboard", "/reports", "/settings"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Protect /remediation — redirect to /login if not authenticated
  if (path.startsWith("/remediation") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Protect pro routes — require auth + pro role
  if (PRO_ROUTES.some((route) => path.startsWith(route))) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    const role = user.user_metadata?.role ?? "free";
    if (role !== "pro") {
      const proUrl = request.nextUrl.clone();
      proUrl.pathname = "/pro";
      return NextResponse.redirect(proUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
