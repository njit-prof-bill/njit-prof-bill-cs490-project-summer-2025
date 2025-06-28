"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/authContext";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import RouteLoader from "@/components/RouteLoader";
import { ThemeProvider as AppThemeProvider } from "@/context/themeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Marcus - A modern SaaS application template" />
        <meta name="keywords" content="SaaS, Marcus, Template, Next.js" />
        <meta name="author" content="Fourier Gauss Labs" />
        <meta property="og:title" content="Marcus" />
        <meta property="og:description" content="A modern SaaS application template" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://fouriergauss.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Marcus" />
        <meta name="twitter:description" content="A modern SaaS application template" />
        <meta name="twitter:image" content="/logo.png" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="canonical" href="https://fouriergauss.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AppThemeProvider>
            <Toaster position="top-right" />
            <RouteLoader />
            {children}
          </AppThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}