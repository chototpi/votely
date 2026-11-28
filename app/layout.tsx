import type React from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Bricolage_Grotesque } from "next/font/google";
import { AppWrapper } from "@/components/app-wrapper";
import "./globals.css";

const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading-src",
});

export const metadata: Metadata = {
  title: "Made with App Studio",
  description:
    "Votely is a social polling platform for the Pi Network community. Create polls, vote, and discuss.",
    generator: 'v0.app'
};

export const viewport: Viewport = {
  themeColor: "#f4f8fb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={headingFont.variable}>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
