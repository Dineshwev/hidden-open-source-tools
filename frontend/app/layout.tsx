import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Portfolio Universe - Mystery Download Box",
  description:
    "An open-source platform for unlocking random digital downloads, contributing resources, and moderating a creator-powered mystery economy."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Adsterra Social Bar */}
        <Script
          type="text/javascript"
          src="//pl29057275.profitablecpmratenetwork.com/5c/1c/50/5c1c50649255aa22a89926928f273f7f.js"
          strategy="lazyOnload"
        />
        {/* Adsterra Popunder */}
        <Script
          type="text/javascript"
          src="//pl29057277.profitablecpmratenetwork.com/0d/33/17/0d331706a51e24f4d4635b990ad03e17.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <ScrollProgress />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 pt-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
