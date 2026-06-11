import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | QuizPlatform Pro",
    default: "QuizPlatform Pro - Online Test Series & Competitive Exams Mock Tests",
  },
  description: "Attempt online mock tests for General Knowledge, Current Affairs, Science, Mathematics, Grammar, and computer technology. Instantly check results, review performance analytics, and download certificates.",
  keywords: ["quiz platform", "competitive exams", "test series", "mock test", "GK quiz", "online exams", "SheetJS import", "result analysis"],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
