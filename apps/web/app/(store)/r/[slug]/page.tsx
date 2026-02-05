import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery, fetchForSchema, api } from "@/lib/convex-server";
import { RestaurantContent } from "@/components/store/restaurant-content";
import { RestaurantSchema, BreadcrumbSchema } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const restaurant = await fetchQuery(api.customerRestaurants.getRestaurantBySlug, {
      slug,
    });

    if (!restaurant) {
      return {
        title: "Restaurante não encontrado",
      };
    }

    const title = restaurant.name;
    const description =
      restaurant.description ||
      `Peça online do ${restaurant.name}. Veja o cardápio completo e faça seu pedido.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/r/${slug}`,
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: `${baseUrl}/r/${slug}`,
        images: restaurant.coverImageUrl
          ? [{ url: restaurant.coverImageUrl, width: 1200, height: 630, alt: restaurant.name }]
          : restaurant.logoUrl
            ? [{ url: restaurant.logoUrl, width: 400, height: 400, alt: restaurant.name }]
            : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: restaurant.coverImageUrl || restaurant.logoUrl || undefined,
      },
    };
  } catch {
    return {
      title: "Restaurante",
    };
  }
}

export default async function RestaurantBySlugPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch restaurant for JSON-LD schema
  const restaurant = await fetchForSchema(() =>
    fetchQuery(api.customerRestaurants.getRestaurantBySlug, { slug })
  );

  // If restaurant not found at server level, show 404
  if (restaurant === null) {
    notFound();
  }

  return (
    <>
      {restaurant && (
        <>
          <RestaurantSchema
            name={restaurant.name}
            description={restaurant.description}
            address={restaurant.address}
            phone={restaurant.phone}
            imageUrl={restaurant.coverImageUrl || restaurant.logoUrl}
            rating={restaurant.rating}
            url={`${baseUrl}/r/${slug}`}
          />
          <BreadcrumbSchema
            baseUrl={baseUrl}
            items={[
              { name: "Início", href: "/" },
              { name: "Restaurantes", href: "/restaurants" },
              { name: restaurant.name, href: `/r/${slug}` },
            ]}
          />
        </>
      )}
      <RestaurantContent slug={slug} />
    </>
  );
}
