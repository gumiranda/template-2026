import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/store(.*)",
  "/restaurants(.*)",
  "/products(.*)",
  "/categories(.*)",
  "/success(.*)",
  "/solucoes(.*)",
  "/for(.*)",
  "/vs(.*)",
  "/r(.*)",
]);

const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.convex.cloud https://*.convex.site https://*.clerk.com; font-src 'self' data:; connect-src 'self' https://*.convex.cloud https://*.convex.site https://*.clerk.accounts.dev https://*.clerk.com wss://*.convex.cloud; frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com; frame-ancestors 'none';",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith('/org-selection')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
