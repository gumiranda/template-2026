import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isValidRestaurantId } from "@workspace/backend/lib/helpers";
import { fetchQuery, api } from "@/lib/convex-server";
import { RestaurantContent } from "@/components/store/restaurant-content";
import { RestaurantSchema, BreadcrumbSchema } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  if (!isValidRestaurantId(id)) {
    return {
      title: "Restaurante não encontrado",
    };
  }

  try {
    const restaurant = await fetchQuery(api.customerRestaurants.getPublicRestaurant, {
      restaurantId: id,
    });

    if (!restaurant) {
      return {
        title: "Restaurante não encontrado",
      };
    }

    // If restaurant has a slug, indicate this is not the canonical URL
    const canonicalUrl = restaurant.slug
      ? `/r/${restaurant.slug}`
      : `/restaurants/${id}`;

    const title = restaurant.name;
    const description =
      restaurant.description ||
      `Peça online do ${restaurant.name}. Veja o cardápio completo e faça seu pedido.`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      robots: restaurant.slug
        ? { index: false, follow: true } // Don't index old URL if slug exists
        : { index: true, follow: true },
      openGraph: {
        title,
        description,
        type: "website",
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

export default async function RestaurantDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!isValidRestaurantId(id)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Restaurante não encontrado</h1>
        <p className="mt-2 text-muted-foreground">O ID fornecido não é válido.</p>
      </div>
    );
  }

  // Fetch restaurant to check for slug and redirect
  let restaurant: Awaited<
    ReturnType<typeof fetchQuery<typeof api.customerRestaurants.getPublicRestaurant>>
  > | null = null;

  try {
    restaurant = await fetchQuery(api.customerRestaurants.getPublicRestaurant, {
      restaurantId: id,
    });
  } catch {
    // Schema will be omitted if fetch fails
  }

  // 301 redirect to slug-based URL if slug exists
  if (restaurant?.slug) {
    redirect(`/r/${restaurant.slug}`);
  }

  // Canonical URL (for restaurants without slugs yet)
  const canonicalUrl = `/restaurants/${id}`;

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
            url={`${baseUrl}${canonicalUrl}`}
          />
          <BreadcrumbSchema
            baseUrl={baseUrl}
            items={[
              { name: "Início", href: "/" },
              { name: "Restaurantes", href: "/restaurants" },
              { name: restaurant.name, href: canonicalUrl },
            ]}
          />
        </>
      )}
      <RestaurantContent restaurantId={id} />
    </>
  );
}
