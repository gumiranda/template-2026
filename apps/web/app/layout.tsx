import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@workspace/ui/components/sonner";
import { ErrorBoundary } from "@/components/error-boundary";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Food Delivery";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${siteName} - Peça comida online`,
    template: `%s | ${siteName}`,
  },
  description:
    "Peça comida dos melhores restaurantes da sua região. Entrega rápida, cardápios variados e ofertas exclusivas.",
  keywords: ["delivery", "comida", "restaurantes", "pedidos online", "entrega"],
  authors: [{ name: siteName }],
  creator: siteName,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName,
    title: `${siteName} - Peça comida online`,
    description:
      "Peça comida dos melhores restaurantes da sua região. Entrega rápida, cardápios variados e ofertas exclusivas.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Peça comida online`,
    description:
      "Peça comida dos melhores restaurantes da sua região. Entrega rápida, cardápios variados e ofertas exclusivas.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <ErrorBoundary>
          <Providers>
            <Toaster />
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
