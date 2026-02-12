import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LoginFormSchema } from "@/lib/definitions";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        // 1. Validate inputs matches Zod Schema
        const parsedCredentials = LoginFormSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          // 2. Fetch user from DB
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user || !user.passwordHash) return null;

          // 3. Compare passwords
          const passwordsMatch = await bcrypt.compare(
            password,
            user.passwordHash,
          );

          if (passwordsMatch) {
            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              image: user.image,
            };
          }
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/",
  },
});
