import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";
import AppLayout from "@/components/AppLayout";

// Font definitions
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

// Metadata
export const metadata: Metadata = {
  title: "Pepe Tubes Airdrop",
  description: "Complete tasks and earn PEPE token rewards",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pepetubes.vercel.app'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Polyfill yang sangat minimal untuk global object */}
        <Script id="global-polyfill" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined') {
              window.global = window;
            }
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} antialiased text-white min-h-screen`}>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
