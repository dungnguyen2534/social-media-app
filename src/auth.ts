import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { env } from "./env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google,
    Nodemailer({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
    }),
  ],
  events: {
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: "Socius User",
          username: user.id,
        },
      });
    },
  },
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
});
