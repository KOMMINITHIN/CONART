import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProfessionalNavigation } from "@/components/ProfessionalNavigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConArt - Free Online Tools for Students & Professionals",
  description: "Comprehensive suite of free online tools for image compression, PDF processing, document editing, and more. No registration required, privacy-focused.",
  keywords: "image compression, PDF tools, online tools, free tools, image resize, watermark, signature maker",
  authors: [{ name: "ConArt" }],
  robots: "index, follow",
  openGraph: {
    title: "ConArt - Free Online Tools",
    description: "Professional online tools for students and professionals. Compress images, edit PDFs, create signatures and more.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConArt - Free Online Tools",
    description: "Professional online tools for students and professionals.",
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ProfessionalNavigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
