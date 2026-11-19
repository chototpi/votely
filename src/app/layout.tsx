import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Votely — Every Voice Matters",
  description: "A global space to ask, vote, and make your voice count."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
