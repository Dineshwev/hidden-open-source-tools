import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Portfolio Universe - Mystery Download Box",
  description:
    "An open-source platform for unlocking random digital downloads, contributing resources, and moderating a creator-powered mystery economy."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
