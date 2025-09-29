import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export function getAuthOptions(): NextAuthOptions {
  return {
    // No adapter to avoid build-time admin credential evaluation; JWT sessions only
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = (user as any).role ?? "resident";
        }
        return token as any;
      },
      async session({ session, token }) {
        (session.user as any).role = (token as any).role ?? "resident";
        return session;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
}
