export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|site.webmanifest|sw.js|icons/.*|apple-touch-icon.png|auth|api/auth).*)",
  ],
};
