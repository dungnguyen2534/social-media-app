import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import { cache } from "react";

declare module "next-auth" {
  interface Session {
    user: {
      username: string | null | undefined;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      from: "noreply@socius.click",
    }),
  ],
  pages: {
    verifyRequest: "/verify-request",
  },
});

export const getSessionData = cache(auth);
