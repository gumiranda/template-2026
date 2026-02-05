import type { Metadata } from "next";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { fetchQuery, api } from "@/lib/convex-server";
import { ProductDetailContent } from "@/components/store/product-detail-content";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price / 100);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const menuItemId = id as Id<"menuItems">;

  try {
    const product = await fetchQuery(api.customerMenu.getProductDetails, {
      menuItemId,
    });

    if (!product) {
      return {
        title: "Produto não encontrado",
      };
    }

    const price = product.discountedPrice ?? product.price;
    const title = `${product.name} - ${formatPrice(price)}`;
    const description =
      product.description ||
      `${product.name} do ${product.restaurant.name}. Peça agora!`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: product.imageUrl
          ? [{ url: product.imageUrl, width: 600, height: 600, alt: product.name }]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: product.imageUrl || undefined,
      },
    };
  } catch {
    return {
      title: "Produto",
    };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const menuItemId = id as Id<"menuItems">;

  // Fetch product for JSON-LD schema
  let product: Awaited<
    ReturnType<typeof fetchQuery<typeof api.customerMenu.getProductDetails>>
  > | null = null;

  try {
    product = await fetchQuery(api.customerMenu.getProductDetails, {
      menuItemId,
    });
  } catch {
    // Schema will be omitted if fetch fails
  }

  return (
    <>
      {product && (
        <>
          <ProductSchema
            name={product.name}
            description={product.description}
            imageUrl={product.imageUrl}
            price={product.price}
            discountedPrice={product.discountedPrice}
            url={`${baseUrl}/products/${id}`}
            restaurantName={product.restaurant.name}
          />
          <BreadcrumbSchema
            baseUrl={baseUrl}
            items={[
              { name: "Início", href: "/" },
              {
                name: product.restaurant.name,
                href: product.restaurant.slug
                  ? `/r/${product.restaurant.slug}`
                  : `/restaurants/${product.restaurantId}`,
              },
              { name: product.name, href: `/products/${id}` },
            ]}
          />
        </>
      )}
      <ProductDetailContent menuItemId={menuItemId} />
    </>
  );
}
