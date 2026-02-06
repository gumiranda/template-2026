import type { MetadataRoute } from "next";
import { fetchQuery, api } from "@/lib/convex-server";
import { getAllCompetitorSlugs } from "@/lib/data/competitors";
import { getAllPersonaSlugs } from "@/lib/data/personas";
import { getAllSolutionSlugs } from "@/lib/data/solutions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/restaurants`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/solucoes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/for`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/vs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
  ];

  // Marketing pSEO routes - Comparisons
  const comparisonRoutes: MetadataRoute.Sitemap = getAllCompetitorSlugs().map(
    (slug) => ({
      url: `${baseUrl}/vs/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })
  );

  // Marketing pSEO routes - Personas
  const personaRoutes: MetadataRoute.Sitemap = getAllPersonaSlugs().map(
    (slug) => ({
      url: `${baseUrl}/for/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })
  );

  // Marketing pSEO routes - Solutions
  const solutionRoutes: MetadataRoute.Sitemap = getAllSolutionSlugs().map(
    (slug) => ({
      url: `${baseUrl}/solucoes/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })
  );

  try {
    // Fetch all active restaurants
    const restaurants = await fetchQuery(api.customerRestaurants.listPublicRestaurants);
    const restaurantRoutes: MetadataRoute.Sitemap = restaurants.map((restaurant) => {
      // Use slug-based URL if available, otherwise fall back to ID
      const path = restaurant.slug
        ? `/r/${restaurant.slug}`
        : `/restaurants/${restaurant._id}`;

      return {
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });

    // Fetch all active food categories
    const categories = await fetchQuery(api.foodCategories.listFoodCategories);
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/categories/${category._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [
      ...staticRoutes,
      ...comparisonRoutes,
      ...personaRoutes,
      ...solutionRoutes,
      ...restaurantRoutes,
      ...categoryRoutes,
    ];
  } catch {
    // If Convex queries fail, return static + marketing routes
    return [...staticRoutes, ...comparisonRoutes, ...personaRoutes, ...solutionRoutes];
  }
}
