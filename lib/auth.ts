import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (!process.env.DATABASE_URL) return null;
        const [{ compare }, { prisma }] = await Promise.all([
          import("bcrypt").then((m) => ({ compare: m.compare })),
          import("@/lib/db"),
        ]);
        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
        });
        if (!user) return null;
        const ok = await compare(String(credentials.password), user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAdmin = (auth?.user as { role?: Role } | undefined)?.role === "admin";
      const isAdminRoute = pathname.startsWith("/admin");
      const isClientProtected =
        pathname.startsWith("/today") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/results") ||
        pathname.startsWith("/programs") ||
        pathname.startsWith("/progress") ||
        pathname.startsWith("/account") ||
        pathname.startsWith("/tasks") ||
        pathname.startsWith("/inbox") ||
        pathname.startsWith("/coaching");
      const isProtected = isAdminRoute || isClientProtected;
      if (isProtected && !isLoggedIn) return false;
      if (isAdminRoute && isLoggedIn && !isAdmin) {
        return Response.redirect(new URL("/today", request.nextUrl));
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
});
