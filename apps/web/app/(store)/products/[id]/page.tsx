import type { Metadata } from "next";
import { isValidMenuItemId } from "@workspace/backend/lib/helpers";
import { fetchQuery, fetchForSchema, api } from "@/lib/convex-server";
import { formatCurrency } from "@/lib/format";
import { ProductDetailContent } from "@/components/store/product-detail-content";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  if (!isValidMenuItemId(id)) {
    return {
      title: "Produto não encontrado",
    };
  }

  try {
    const product = await fetchQuery(api.customerMenu.getProductDetails, {
      menuItemId: id,
    });

    if (!product) {
      return {
        title: "Produto não encontrado",
      };
    }

    const price = product.discountedPrice ?? product.price;
    const title = `${product.name} - ${formatCurrency(price)}`;
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

  if (!isValidMenuItemId(id)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <p className="mt-2 text-muted-foreground">O ID fornecido não é válido.</p>
      </div>
    );
  }

  // Fetch product for JSON-LD schema
  const product = await fetchForSchema(() =>
    fetchQuery(api.customerMenu.getProductDetails, { menuItemId: id })
  );

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
      <ProductDetailContent menuItemId={id} />
    </>
  );
}
