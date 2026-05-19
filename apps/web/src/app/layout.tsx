import type { Metadata } from "next";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic", "latin"],
  variable: "--font-ethiopic",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SME Ops Platform",
  description:
    "AI-powered business operations for small and medium enterprises. Sell faster, track smarter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoEthiopic.variable} font-sans [font-family:var(--font-inter),var(--font-ethiopic),system-ui,sans-serif]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
