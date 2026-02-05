import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/restaurants",
          "/restaurants/*",
          "/r/*",
          "/products/*",
          "/categories/*",
          "/vs/*",
          "/for/*",
        ],
        disallow: [
          "/menu/*", // QR code dine-in routes (session-specific)
          "/dashboard/*",
          "/admin/*",
          "/sign-in",
          "/sign-up",
          "/pending-approval",
          "/register",
          "/bootstrap",
          "/api/*",
          "/my-orders/*",
          "/my-favorites",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
