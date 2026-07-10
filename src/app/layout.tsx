import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://freerock.co.zw"),
  title: "Freerock Solar & Energy | Zimbabwe Solar Installations",
  description:
    "Instant solar quotes, professional installation, and certified training in Zimbabwe.",
  manifest: "/manifest.webmanifest",
  icons: { apple: "/logo.jpg" },
  appleWebApp: { capable: true, title: "Freerock", statusBarStyle: "default" },
  openGraph: {
    title: "Freerock Solar & Energy | Zimbabwe Solar Installations",
    description: "Instant solar quotes, professional installation, and certified training in Zimbabwe.",
    siteName: "Freerock Solar & Energy",
    images: [{ url: "/logo.jpg", width: 512, height: 512 }],
    locale: "en_ZW",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <meta name="theme-color" content="#228B22" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-startup-image" href="/logo.jpg" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
