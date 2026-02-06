import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // Define protected routes
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/blogs/write") ||
    nextUrl.pathname.startsWith("/my-blogs") ||
    nextUrl.pathname.includes("/edit"); // Protects edit pages

  if (isProtectedRoute && !isLoggedIn) {
    // Redirect to home if trying to access protected route logged out
    // The UI should then ideally pop open the Login Modal (handled via client state later)
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  // Matcher ignores static files and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
