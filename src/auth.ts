import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import { cache } from "react";
import { renderMagicLinkEmail } from "./components/common/MagicLinkEmail";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";

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
  callbacks: {
    authorized: async ({ request, auth }) => {
      const pathname = request.nextUrl.pathname;

      // Protect these paths to signed-in users only.
      const protectedPaths = [
        "/messages",
        "/notifications",
        "/search",
        "/bookmarks",
        "/complete-profile",
      ];

      if (!auth && protectedPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      if (!auth?.user.username) {
        return NextResponse.redirect(new URL("/complete-profile", request.url));
      }

      // Prevent signed-in users from accessing auth pages.
      const authPaths = ["/sign-in", "/complete-profile"];

      if (auth && authPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return !!auth;
    },
  },
});

export const getSessionData = cache(auth);
