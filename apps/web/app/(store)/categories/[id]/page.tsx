import type { Metadata } from "next";
import { isValidFoodCategoryId } from "@workspace/backend/lib/helpers";
import { fetchQuery, api } from "@/lib/convex-server";
import { CategoryDetailContent } from "@/components/store/category-detail-content";
import { CollectionPageSchema, BreadcrumbSchema } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  if (!isValidFoodCategoryId(id)) {
    return {
      title: "Categoria não encontrada",
    };
  }

  try {
    const category = await fetchQuery(
      api.foodCategories.getFoodCategoryWithProducts,
      { foodCategoryId: id }
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

  if (!isValidFoodCategoryId(id)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Categoria não encontrada</h1>
        <p className="mt-2 text-muted-foreground">O ID fornecido não é válido.</p>
      </div>
    );
  }

  // Fetch category for JSON-LD schema
  let category: Awaited<
    ReturnType<typeof fetchQuery<typeof api.foodCategories.getFoodCategoryWithProducts>>
  > | null = null;

  try {
    category = await fetchQuery(api.foodCategories.getFoodCategoryWithProducts, {
      foodCategoryId: id,
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
      <CategoryDetailContent foodCategoryId={id} />
    </>
  );
}
