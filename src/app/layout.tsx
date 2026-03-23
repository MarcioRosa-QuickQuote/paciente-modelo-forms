import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PageFadeIn from "@/components/page-fade-in";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capta+",
  description: "Formulários de conversão para captação de pacientes modelo",
  icons: {
    icon: [
      { url: "/capta.png", sizes: "1024x1024", type: "image/png" },
      { url: "/capta.png", sizes: "512x512", type: "image/png" },
      { url: "/capta.png", sizes: "192x192", type: "image/png" },
      { url: "/capta.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/capta.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/capta.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PageFadeIn>{children}</PageFadeIn>
      </body>
    </html>
  );
}
