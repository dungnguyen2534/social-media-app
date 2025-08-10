import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import { cache } from "react";
import { renderMagicLinkEmail } from "./components/MagicLinkEmail";

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
      from: "no-reply@socius.click",
      async sendVerificationRequest({ identifier: to, url, provider }) {
        const { host } = new URL(url);
        const { html, text } = await renderMagicLinkEmail(url, host);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to,
            subject: `Sign in to ${host}`,
            html: html,
            text: text,
          }),
        });

        if (!res.ok)
          throw new Error("Resend error: " + JSON.stringify(await res.json()));
      },
    }),
  ],
});

export const getSessionData = cache(auth);
