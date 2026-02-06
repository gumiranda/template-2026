import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  getCompetitorBySlug,
  getAllCompetitorSlugs,
} from "@/lib/data/competitors";
import { BreadcrumbSchema, JsonLd } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Food Delivery";

interface PageProps {
  params: Promise<{ competitor: string }>;
}

export async function generateStaticParams() {
  return getAllCompetitorSlugs().map((competitor) => ({ competitor }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { competitor: slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    return { title: "Comparação não encontrada" };
  }

  const title = `${siteName} vs ${competitor.name}: Qual escolher?`;
  const description = `Compare ${siteName} com ${competitor.name}. Veja preços, funcionalidades e descubra qual é a melhor solução para seu restaurante.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/vs/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/vs/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const VALID_SLUG_REGEX = /^[a-z0-9-]+$/;

export default async function ComparisonPage({ params }: PageProps) {
  const { competitor: slug } = await params;

  if (!VALID_SLUG_REGEX.test(slug)) {
    notFound();
  }

  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    notFound();
  }

  // FAQ Schema for rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Qual a diferença entre ${siteName} e ${competitor.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${siteName} oferece ${competitor.ourAdvantages.slice(0, 3).join(", ")}. Já ${competitor.name} ${competitor.limitations.slice(0, 2).join(" e ")}.`,
        },
      },
      {
        "@type": "Question",
        name: `${siteName} é mais barato que ${competitor.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${competitor.name} cobra ${competitor.pricing}. ${siteName} oferece planos transparentes sem comissões por pedido nem taxas escondidas.`,
        },
      },
      {
        "@type": "Question",
        name: `Por que restaurantes trocam ${competitor.name} por ${siteName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: competitor.switchReasons.join(" "),
        },
      },
    ],
  };

  return (
    <>
      <BreadcrumbSchema
        baseUrl={baseUrl}
        items={[
          { name: "Início", href: "/" },
          { name: "Comparações", href: "/vs" },
          { name: `vs ${competitor.name}`, href: `/vs/${slug}` },
        ]}
      />
      <JsonLd data={faqSchema} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Comparação
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            {siteName} vs {competitor.name}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Compare as duas soluções e descubra qual é a melhor para o seu
            restaurante.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">
                Testar {siteName} grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/restaurants">Ver restaurantes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            Comparação lado a lado
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Our Product */}
            <Card className="border-primary">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Badge>Recomendado</Badge>
                  {siteName}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Preço</p>
                  <p className="font-semibold">
                    Planos a partir de R$49/mês, sem comissões
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Principais vantagens
                  </p>
                  <ul className="space-y-2">
                    {competitor.ourAdvantages.map((advantage, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Competitor */}
            <Card>
              <CardHeader>
                <CardTitle>{competitor.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Preço</p>
                  <p className="font-semibold">{competitor.pricing}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Limitações
                  </p>
                  <ul className="space-y-2">
                    {competitor.limitations.map((limitation, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why People Switch */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            Por que restaurantes trocam {competitor.name} por {siteName}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Estas são as principais razões que ouvimos de restaurantes que
            fizeram a mudança.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {competitor.switchReasons.map((reason, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-lg font-bold text-primary">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm">{reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor Features (Fair Comparison) */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            O que {competitor.name} faz bem
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Para ser justo, {competitor.name} também tem seus pontos fortes.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {competitor.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 rounded-lg border"
              >
                <Check className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

      {/* Related Comparisons */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Outras comparações
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {getAllCompetitorSlugs()
              .filter((s) => s !== slug)
              .slice(0, 4)
              .map((s) => {
                const c = getCompetitorBySlug(s);
                if (!c) return null;
                return (
                  <Button key={s} asChild variant="outline">
                    <Link href={`/vs/${s}`}>{siteName} vs {c.name}</Link>
                  </Button>
                );
              })}
          </div>
        </div>
      </section>
    </>
  );
}
