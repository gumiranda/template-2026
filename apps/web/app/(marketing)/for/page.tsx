import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { personas } from "@/lib/data/personas";
import { BreadcrumbSchema, ItemListSchema } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Food Delivery";

export const metadata: Metadata = {
  title: `Para Quem | ${siteName}`,
  description:
    "Veja como o " +
    siteName +
    " atende diferentes tipos de restaurantes: pizzarias, hamburguerias, cafeterias, bares, food trucks, sorveterias e padarias.",
  alternates: {
    canonical: "/for",
  },
  openGraph: {
    title: `Para Quem | ${siteName}`,
    description:
      "Soluções personalizadas para cada tipo de restaurante.",
    type: "website",
    url: `${baseUrl}/for`,
  },
};

export default function ForHubPage() {
  return (
    <>
      <BreadcrumbSchema
        baseUrl={baseUrl}
        items={[
          { name: "Início", href: "/" },
          { name: "Para Quem", href: "/for" },
        ]}
      />
      <ItemListSchema
        items={personas.map((p, i) => ({
          name: p.name,
          url: `${baseUrl}/for/${p.slug}`,
          position: i + 1,
        }))}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Para Quem
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Feito para o seu tipo de restaurante
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Cada negócio tem suas particularidades. Veja como o {siteName} se
            adapta ao seu.
          </p>
          <Button asChild size="lg">
            <Link href="/register">
              Começar gratuitamente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Personas Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {personas.map((persona) => (
              <Link
                key={persona.slug}
                href={`/for/${persona.slug}`}
                className="group"
              >
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-4">{persona.icon}</div>
                    <h2 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {persona.name}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {persona.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Encontrou seu tipo de restaurante?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Comece agora e configure em minutos. Sem contratos.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">
              Começar agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
