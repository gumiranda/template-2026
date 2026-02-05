import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { competitors } from "@/lib/data/competitors";
import { BreadcrumbSchema, ItemListSchema } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Food Delivery";

export const metadata: Metadata = {
  title: `Comparações | ${siteName}`,
  description:
    "Compare o " +
    siteName +
    " com as principais alternativas do mercado: iFood, Rappi, Toast, Square, Goomer e Anota AI. Veja preços, funcionalidades e descubra a melhor opção.",
  alternates: {
    canonical: "/vs",
  },
  openGraph: {
    title: `Comparações | ${siteName}`,
    description:
      "Compare com as principais alternativas do mercado.",
    type: "website",
    url: `${baseUrl}/vs`,
  },
};

export default function VsHubPage() {
  return (
    <>
      <BreadcrumbSchema
        baseUrl={baseUrl}
        items={[
          { name: "Início", href: "/" },
          { name: "Comparações", href: "/vs" },
        ]}
      />
      <ItemListSchema
        items={competitors.map((c, i) => ({
          name: `${siteName} vs ${c.name}`,
          url: `${baseUrl}/vs/${c.slug}`,
          position: i + 1,
        }))}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Comparações
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            {siteName} vs alternativas
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Compare preços, funcionalidades e descubra por que restaurantes
            escolhem o {siteName}.
          </p>
          <Button asChild size="lg">
            <Link href="/register">
              Testar {siteName} grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Competitors Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {competitors.map((competitor) => (
              <Link
                key={competitor.slug}
                href={`/vs/${competitor.slug}`}
                className="group"
              >
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardContent className="pt-6">
                    <Badge variant="outline" className="mb-3">
                      vs
                    </Badge>
                    <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {siteName} vs {competitor.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {competitor.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {competitor.pricing}
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
            Pronto para experimentar {siteName}?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Configure seu restaurante em minutos. Sem contratos, sem taxas
            escondidas.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">
              Começar gratuitamente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
