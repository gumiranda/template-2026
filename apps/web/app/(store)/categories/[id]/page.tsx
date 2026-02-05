import type { Metadata } from "next";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { fetchQuery, api } from "@/lib/convex-server";
import { CategoryDetailContent } from "@/components/store/category-detail-content";
import { CollectionPageSchema, BreadcrumbSchema } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const foodCategoryId = id as Id<"foodCategories">;

  try {
    const category = await fetchQuery(
      api.foodCategories.getFoodCategoryWithProducts,
      { foodCategoryId }
    );

    if (!category) {
      return {
        title: "Categoria não encontrada",
      };
    }

    const title = `${category.name} - Restaurantes e produtos`;
    const restaurantCount = category.restaurants.length;
    const description =
      restaurantCount > 0
        ? `Encontre os melhores restaurantes de ${category.name}. ${restaurantCount} restaurante${restaurantCount > 1 ? "s" : ""} disponíve${restaurantCount > 1 ? "is" : "l"}.`
        : `Explore restaurantes e produtos de ${category.name}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: category.imageUrl
          ? [{ url: category.imageUrl, width: 400, height: 400, alt: category.name }]
          : undefined,
      },
      twitter: {
        card: "summary",
        title,
        description,
        images: category.imageUrl || undefined,
      },
    };
  } catch {
    return {
      title: "Categoria",
    };
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;
  const foodCategoryId = id as Id<"foodCategories">;

  // Fetch category for JSON-LD schema
  let category: Awaited<
    ReturnType<typeof fetchQuery<typeof api.foodCategories.getFoodCategoryWithProducts>>
  > | null = null;

  try {
    category = await fetchQuery(api.foodCategories.getFoodCategoryWithProducts, {
      foodCategoryId,
    });
  } catch {
    // Schema will be omitted if fetch fails
  }

  const restaurantCount = category?.restaurants.length ?? 0;
  const description =
    restaurantCount > 0
      ? `Encontre os melhores restaurantes de ${category?.name}. ${restaurantCount} restaurante${restaurantCount > 1 ? "s" : ""} disponíve${restaurantCount > 1 ? "is" : "l"}.`
      : `Explore restaurantes e produtos de ${category?.name}.`;

  return (
    <>
      {category && (
        <>
          <CollectionPageSchema
            name={category.name}
            description={description}
            url={`${baseUrl}/categories/${id}`}
            imageUrl={category.imageUrl}
            itemCount={restaurantCount}
          />
          <BreadcrumbSchema
            baseUrl={baseUrl}
            items={[
              { name: "Início", href: "/" },
              { name: category.name, href: `/categories/${id}` },
            ]}
          />
        </>
      )}
      <CategoryDetailContent foodCategoryId={foodCategoryId} />
    </>
  );
}
