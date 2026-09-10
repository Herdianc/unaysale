import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/layout/site-chrome";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UNAYSALE - Temukan Properti Impian Anda",
  description:
    "UNAYSALE adalah marketplace properti terpercaya di Indonesia. Temukan rumah, apartemen, tanah, dan properti lainnya untuk dijual atau disewa.",
  keywords: [
    "properti",
    "rumah dijual",
    "apartemen",
    "sewa properti",
    "marketplace properti Indonesia",
    "UNAYSALE",
  ],
  openGraph: {
    title: "UNAYSALE - Temukan Properti Impian Anda",
    description:
      "Marketplace properti terpercaya di Indonesia. Jual beli dan sewa properti dengan mudah.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="bg-background text-text font-sans antialiased">
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
