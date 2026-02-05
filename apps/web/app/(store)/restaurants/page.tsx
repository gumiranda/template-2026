import type { Metadata } from "next";
import { RestaurantsListContent } from "@/components/store/restaurants-list-content";
import { BreadcrumbSchema, ItemListSchema } from "@/components/seo/json-ld";
import { fetchQuery, api } from "@/lib/convex-server";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

export const metadata: Metadata = {
  title: "Restaurantes",
  description:
    "Encontre os melhores restaurantes da sua região. Navegue pelo cardápio, veja avaliações e faça seu pedido online.",
  openGraph: {
    title: "Restaurantes",
    description:
      "Encontre os melhores restaurantes da sua região. Navegue pelo cardápio, veja avaliações e faça seu pedido online.",
    type: "website",
  },
};

export default async function RestaurantsPage() {
  // Fetch restaurants for ItemList schema
  let restaurants: Awaited<
    ReturnType<typeof fetchQuery<typeof api.customerRestaurants.listPublicRestaurants>>
  > = [];

  try {
    restaurants = await fetchQuery(api.customerRestaurants.listPublicRestaurants);
  } catch {
    // Schema will be minimal if fetch fails
  }

  return (
    <>
      <BreadcrumbSchema
        baseUrl={baseUrl}
        items={[
          { name: "Início", href: "/" },
          { name: "Restaurantes", href: "/restaurants" },
        ]}
      />
      {restaurants.length > 0 && (
        <ItemListSchema
          items={restaurants.map((r, index) => ({
            name: r.name,
            url: r.slug ? `${baseUrl}/r/${r.slug}` : `${baseUrl}/restaurants/${r._id}`,
            imageUrl: r.logoUrl,
            position: index + 1,
          }))}
        />
      )}
      <RestaurantsListContent />
    </>
  );
}
