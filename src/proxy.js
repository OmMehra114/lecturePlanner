import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If logged in and visiting the root landing page, redirect to /dashboard
  if (userId && req.nextUrl.pathname === '/') {
    return Response.redirect(new URL('/dashboard', req.url));
  }

  // If user is not logged in and tries to access /dashboard, Clerk protects and redirects to /sign-in
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};