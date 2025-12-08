import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/checkout"];

// Routes that are only for unauthenticated users
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

// Role-based route restrictions
const roleRestrictedRoutes: Record<string, string[]> = {
  "/dashboard/organizer": ["ORGANIZER", "ADMIN", "SUPER_ADMIN"],
  "/dashboard/admin": ["ADMIN", "SUPER_ADMIN"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies or authorization header
  // Note: In production with HttpOnly cookies, the backend handles this
  // For now, we check localStorage token via a cookie set by client
  const accessToken = request.cookies.get("accessToken")?.value;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle Chrome DevTools request
  if (request.nextUrl.pathname === "/.well-known/appspecific/com.chrome.devtools.json") {
    return new NextResponse(JSON.stringify({}), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // For role-based routes, we'll do client-side checking since
  // we can't decode JWT in middleware without the secret
  // The AuthGuard component handles this

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
    "/.well-known/appspecific/com.chrome.devtools.json",
  ],
};
