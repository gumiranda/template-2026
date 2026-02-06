import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, QrCode, Smartphone, ClipboardList, Bike, UserCheck } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { solutions } from "@/lib/data/solutions";
import { BreadcrumbSchema, ItemListSchema } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Food Delivery";

export const metadata: Metadata = {
  title: `Soluções para Restaurantes | ${siteName}`,
  description:
    "Conheça todas as soluções do " +
    siteName +
    " para restaurantes: cardápio digital com QR code, pedidos na mesa, comanda digital, delivery próprio e autoatendimento.",
  alternates: {
    canonical: "/solucoes",
  },
  openGraph: {
    title: `Soluções para Restaurantes | ${siteName}`,
    description:
      "Conheça todas as soluções para digitalizar seu restaurante.",
    type: "website",
    url: `${baseUrl}/solucoes`,
  },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  QrCode,
  Smartphone,
  ClipboardList,
  Bike,
  UserCheck,
};

export default function SolucoesHubPage() {
  return (
    <>
      <BreadcrumbSchema
        baseUrl={baseUrl}
        items={[
          { name: "Início", href: "/" },
          { name: "Soluções", href: "/solucoes" },
        ]}
      />
      <ItemListSchema
        items={solutions.map((s, i) => ({
          name: s.name,
          url: `${baseUrl}/solucoes/${s.slug}`,
          position: i + 1,
        }))}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Soluções
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Soluções para restaurantes
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Tudo que seu restaurante precisa para receber pedidos online, na mesa
            e no delivery. Sem complicação.
          </p>
          <Button asChild size="lg">
            <Link href="/register">
              Começar gratuitamente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {solutions.map((solution) => {
              const Icon = ICON_MAP[solution.icon];
              return (
                <Link
                  key={solution.slug}
                  href={`/solucoes/${solution.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-shadow group-hover:shadow-md">
                    <CardContent className="pt-6">
                      {Icon && (
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <h2 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {solution.name}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {solution.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto para modernizar seu restaurante?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Cadastro gratuito, sem contratos e sem taxas escondidas.
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
