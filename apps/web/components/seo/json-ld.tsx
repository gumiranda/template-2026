/**
 * JSON-LD Structured Data Components
 * https://schema.org/
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// -----------------------------------------------------------------------------
// Restaurant Schema (LocalBusiness + Restaurant)
// -----------------------------------------------------------------------------

interface RestaurantSchemaProps {
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  rating?: number;
  url: string;
  priceRange?: string;
}

export function RestaurantSchema({
  name,
  description,
  address,
  phone,
  imageUrl,
  rating,
  url,
  priceRange = "$$",
}: RestaurantSchemaProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "LocalBusiness"],
    name,
    url,
    priceRange,
  };

  if (description) {
    data.description = description;
  }

  if (address) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: address,
    };
  }

  if (phone) {
    data.telephone = phone;
  }

  if (imageUrl) {
    data.image = imageUrl;
  }

  if (rating && rating > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.toFixed(1),
      bestRating: "5",
      worstRating: "1",
    };
  }

  return <JsonLd data={data} />;
}

// -----------------------------------------------------------------------------
// Product Schema (Product + Offer)
// -----------------------------------------------------------------------------

interface ProductSchemaProps {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number; // in cents
  discountedPrice?: number | null; // in cents
  currency?: string;
  url: string;
  restaurantName: string;
  availability?: "InStock" | "OutOfStock";
}

export function ProductSchema({
  name,
  description,
  imageUrl,
  price,
  discountedPrice,
  currency = "BRL",
  url,
  restaurantName,
  availability = "InStock",
}: ProductSchemaProps) {
  const finalPrice = discountedPrice ?? price;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url,
    brand: {
      "@type": "Brand",
      name: restaurantName,
    },
    offers: {
      "@type": "Offer",
      price: (finalPrice / 100).toFixed(2),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
    },
  };

  if (description) {
    data.description = description;
  }

  if (imageUrl) {
    data.image = imageUrl;
  }

  return <JsonLd data={data} />;
}

// -----------------------------------------------------------------------------
// Breadcrumb Schema
// -----------------------------------------------------------------------------

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  baseUrl: string;
}

export function BreadcrumbSchema({ items, baseUrl }: BreadcrumbSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.href}`,
    })),
  };

  return <JsonLd data={data} />;
}

// -----------------------------------------------------------------------------
// Collection Page Schema (for category pages)
// -----------------------------------------------------------------------------

interface CollectionPageSchemaProps {
  name: string;
  description?: string;
  url: string;
  imageUrl?: string | null;
  itemCount?: number;
}

export function CollectionPageSchema({
  name,
  description,
  url,
  imageUrl,
  itemCount,
}: CollectionPageSchemaProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
  };

  if (description) {
    data.description = description;
  }

  if (imageUrl) {
    data.image = imageUrl;
  }

  if (itemCount !== undefined) {
    data.numberOfItems = itemCount;
  }

  return <JsonLd data={data} />;
}

// -----------------------------------------------------------------------------
// Website Schema (for homepage)
// -----------------------------------------------------------------------------

interface WebsiteSchemaProps {
  name: string;
  url: string;
  description?: string;
}

export function WebsiteSchema({ name, url, description }: WebsiteSchemaProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/restaurants?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  if (description) {
    data.description = description;
  }

  return <JsonLd data={data} />;
}

// -----------------------------------------------------------------------------
// ItemList Schema (for restaurant/product lists)
// -----------------------------------------------------------------------------

interface ItemListSchemaProps {
  items: Array<{
    name: string;
    url: string;
    imageUrl?: string | null;
    position: number;
  }>;
}

export function ItemListSchema({ items }: ItemListSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
      ...(item.imageUrl && { image: item.imageUrl }),
    })),
  };

  return <JsonLd data={data} />;
}
