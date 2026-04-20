import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://tmpmail.dev"),
  title: "Tmp Mail - Free Temporary Email Service",
  description: "Receive emails anonymously with our free, private, and secure temporary email address generator. Keep your real inbox clean.",
  openGraph: {
    title: "Tmp Mail - Free Temporary Email",
    description: "Instant, disposable email addresses to keep your personal inbox clean and secure.",
    url: "https://tmpmail.dev",
    siteName: "Tmp Mail",
    locale: "en_US",
    type: "website",
    images: [{ url: "/tmpmail.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tmp Mail - Free Temporary Email",
    description: "Instant, disposable email addresses to keep your personal inbox clean and secure.",
    images: ["/tmpmail.png"],
  },
  alternates: {
    canonical: "https://tmpmail.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-background">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
