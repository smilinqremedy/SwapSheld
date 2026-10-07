import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SwapShield — Nigeria's Premier Gadget Swap & 48-Hour Escrow Hub",
  description: "Trade vetted iPhones, MacBooks, and high-end hardware with algorithmic swap valuation, Paystack escrow protection, and 48-hour hardware verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070b12] text-slate-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
