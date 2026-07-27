import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Spardha Times",
    default: "Spardha Times - Online Test Series & Competitive Exams Tests",
  },
  description: "Attempt online tests for General Knowledge, Current Affairs, Science, Mathematics, Grammar, and computer technology. Instantly check results, review performance analytics, and download certificates.",
  keywords: ["spardha times", "competitive exams", "test series", "test", "GK quiz", "online exams", "MPSC test", "result analysis"],
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Spardha Times",
    title: "Spardha Times - Online Test Series & Competitive Exams Tests",
    description: "Real-time tests with instant results, performance analytics, leaderboards, and certificates.",
    url: siteUrl,
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Spardha Times" }],
  },
  twitter: {
    card: "summary",
    title: "Spardha Times - Online Tests",
    description: "Real-time tests with instant results, analytics, and certificates.",
    images: ["/icon-512.png"],
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the session on the server and hand it to SessionProvider. Without
  // this, useSession() in the Navbar fetches /api/auth/session on mount on
  // every page load — a wasted round trip, a flash of signed-out UI, and in
  // the Android WebView that first fetch races cold start and fails outright
  // ("Failed to fetch", errors.authjs.dev#autherror).
  const session = await getSession();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        <Providers session={session}>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
