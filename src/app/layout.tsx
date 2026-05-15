import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import openBookIcon from "./open-book.png";
import "./globals.css";
import { AppToaster } from "@/components/AppToaster";
import { BubbleBackground } from "@/components/BubbleBackground";
import { Footer } from "@/components/Footer";
import { AnimatedMain } from "@/components/motion";
import { NavBar } from "@/components/NavBar";
import { ScrollToTop } from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thư viện Số Lá Xanh",
  description: "Hệ thống Thư viện Số (Supabase)",
  icons: {
    icon: [{ url: openBookIcon.src, type: "image/png" }],
    apple: [{ url: openBookIcon.src, type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative font-sans min-h-full flex flex-col text-zinc-900 antialiased">
        <BubbleBackground />
        <div className="relative z-0 flex min-h-full flex-1 flex-col">
          <NavBar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
            <AnimatedMain>{children}</AnimatedMain>
          </main>
          <Footer />
        </div>
        <ScrollToTop />
        <AppToaster />
      </body>
    </html>
  );
}
