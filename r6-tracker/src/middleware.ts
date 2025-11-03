import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Routes qui nécessitent une authentification
const protectedRoutes = ["/profile", "/dashboard-new"];

// Routes d'authentification (si connecté, rediriger vers dashboard)
const authRoutes = ["/auth"];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Vérifier si c'est une route d'authentification
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Si route protégée et pas de session, rediriger vers /auth
  if (isProtectedRoute && !session) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Si route d'auth et déjà connecté, rediriger vers dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard-new", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|manifest.json|robots.txt).*)",
  ],
};
