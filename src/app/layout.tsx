import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "UniLost – AI-Powered University Lost & Found",
  description: "Report and recover lost items on campus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 pb-16 pt-7">{children}</main>
      </body>
    </html>
  );
}
