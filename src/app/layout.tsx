import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/app/ThemeProvider";
import ReactQueryProvider from "./ReactQueryProvider";
import { Toaster } from "react-hot-toast";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} overflow-y-scroll antialiased`}
      >
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              toastOptions={{
                style: {
                  borderRadius: "var(--radius-md)",
                  background: "var(--toast-background)",
                  color: "var(--toast-text-color)",
                },
              }}
            />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
