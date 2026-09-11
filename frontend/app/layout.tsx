import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "undangan-digital.link — Undangan Pernikahan Digital",
  description:
    "Buat undangan pernikahan digital yang elegan dan cepat. Pilih desain, isi data, langsung bagikan lewat WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FBF7F0] font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
