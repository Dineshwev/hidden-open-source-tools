import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Cloud Rain - Mystery Download Box",
  description:
    "An open-source platform for unlocking random digital downloads, contributing resources, and moderating a creator-powered mystery economy.",
  other: {
    "adsterra-site-verification": "0BWqbyw168nW"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <ScrollProgress />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 pt-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
