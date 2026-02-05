import type { Metadata } from "next";
import { StoreHomeContent } from "@/components/store/store-home-content";
import { WebsiteSchema } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Food Delivery";

export const metadata: Metadata = {
  title: "Início",
  description:
    "Peça comida dos melhores restaurantes da sua região. Entrega rápida, cardápios variados e ofertas exclusivas todos os dias.",
  openGraph: {
    title: "Peça comida online",
    description:
      "Peça comida dos melhores restaurantes da sua região. Entrega rápida, cardápios variados e ofertas exclusivas todos os dias.",
    type: "website",
  },
};

export default function StoreHomePage() {
  return (
    <>
      <WebsiteSchema
        name={siteName}
        url={baseUrl}
        description="Peça comida dos melhores restaurantes da sua região. Entrega rápida, cardápios variados e ofertas exclusivas."
      />
      <StoreHomeContent />
    </>
  );
}
