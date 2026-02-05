import type { Metadata } from "next";
import { StoreHomeContent } from "@/components/store/store-home-content";
import { WebsiteSchema, ItemListSchema } from "@/components/seo/json-ld";
import { fetchQuery, fetchForSchema, api } from "@/lib/convex-server";

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

export default async function StoreHomePage() {
  const [categories, recommended, discountedProducts, banners] =
    await Promise.all([
      fetchForSchema(() => fetchQuery(api.foodCategories.listFoodCategories)),
      fetchForSchema(() =>
        fetchQuery(api.customerRestaurants.getRecommendedRestaurants)
      ),
      fetchForSchema(() =>
        fetchQuery(api.customerMenu.getRecommendedProducts)
      ),
      fetchForSchema(() => fetchQuery(api.promoBanners.listActiveBanners)),
    ]);

  const restaurantSchemaItems =
    recommended?.map((r, i) => ({
      name: r.name,
      url: `${baseUrl}/r/${r.slug}`,
      imageUrl: r.logoUrl,
      position: i + 1,
    })) ?? [];

  return (
    <>
      <WebsiteSchema
        name={siteName}
        url={baseUrl}
        description="Peça comida dos melhores restaurantes da sua região. Entrega rápida, cardápios variados e ofertas exclusivas."
      />
      {restaurantSchemaItems.length > 0 && (
        <ItemListSchema items={restaurantSchemaItems} />
      )}
      <StoreHomeContent
        initialCategories={categories}
        initialRecommended={recommended}
        initialDiscountedProducts={discountedProducts}
        initialBanners={banners}
      />
    </>
  );
}
