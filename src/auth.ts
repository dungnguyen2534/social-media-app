import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import Resend from "next-auth/providers/resend";
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
    Resend({
      from: "noreply@socius.click",
    }),
  ],
});

export const getSessionData = cache(auth); // deduplicate requests in server components
