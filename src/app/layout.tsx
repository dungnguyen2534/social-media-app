import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/app/ThemeProvider";
import ReactQueryProvider from "./ReactQueryProvider";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import ClientToaster from "@/components/common/ClientToaster";
import NextTopLoader from "nextjs-toploader";
import { env } from "@/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Socius",
    default: "Socius",
  },
  description: "A place to share thoughts and connect with others.",
  openGraph: {
    title: "Socius | A place to share thoughts and connect with others.",
    description: "A place to share thoughts and connect with others.",
    url: env.NEXT_PUBLIC_URL,
    siteName: "Socius",
    images: [
      {
        url: "/images/socius-og-image.png",
        width: 1200,
        height: 630,
        alt: "Socius",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Socius | Share thoughts and connect",
    description: "A place to share thoughts and connect with others.",
    images: ["/images/socius-og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} !mr-0 !overflow-y-scroll text-sm antialiased lg:px-2`}
      >
        <ReactQueryProvider>
          {/* Uploadthing SSR Plugin */}
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader height={1.2} showSpinner={false} />
            {children}
            <ClientToaster
              toastOptions={{
                style: {
                  borderRadius: "var(--radius-md)",
                  background: "var(--toast-background)",
                  color: "var(--toast-text-color)",
                },
                position: "bottom-right",
              }}
            />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
