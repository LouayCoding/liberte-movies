import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Liberté - Stream Movies & TV Shows",
  description: "Browse and stream the latest movies and TV shows for free.",
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0b0d14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[--background] text-[--foreground] antialiased`}>
        <Navbar />
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <footer className="hidden md:block border-t border-white/[0.06] mt-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
            <p className="text-[--muted-dark] text-sm text-center">
              © 2026 Liberté. Data provided by TMDB & Jikan.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
