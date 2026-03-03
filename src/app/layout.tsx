import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { ToastViewport } from "@/components/toast-viewport";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Hushh Connect",
  description: "Campus gig marketplace for students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} bg-[#0a0a0a]`}>
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}


