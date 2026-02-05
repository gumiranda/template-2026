import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  ArrowRight,
  QrCode,
  Smartphone,
  ClipboardList,
  Bike,
  UserCheck,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  getSolutionBySlug,
  getAllSolutionSlugs,
} from "@/lib/data/solutions";
import { getPersonaBySlug } from "@/lib/data/personas";
import { BreadcrumbSchema, JsonLd } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Food Delivery";

interface PageProps {
  params: Promise<{ feature: string }>;
}

export async function generateStaticParams() {
  return getAllSolutionSlugs().map((feature) => ({ feature }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { feature: slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    return { title: "Página não encontrada" };
  }

  const title = `${solution.name} | ${siteName}`;
  const description = solution.description;

  return {
    title,
    description,
    keywords: solution.keywords,
    alternates: {
      canonical: `/solucoes/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/solucoes/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const VALID_SLUG_REGEX = /^[a-z0-9-]+$/;

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  QrCode,
  Smartphone,
  ClipboardList,
  Bike,
  UserCheck,
};

export default async function SolutionPage({ params }: PageProps) {
  const { feature: slug } = await params;

  if (!VALID_SLUG_REGEX.test(slug)) {
    notFound();
  }

  const solution = getSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  const Icon = ICON_MAP[solution.icon];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: solution.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${siteName} — ${solution.name}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    description: solution.description,
    offers: {
      "@type": "Offer",
      price: "49",
      priceCurrency: "BRL",
    },
  };

  const relatedPersonas = solution.relatedPersonas
    .map(getPersonaBySlug)
    .filter((p): p is NonNullable<typeof p> => p != null);

  const otherSolutions = getAllSolutionSlugs()
    .filter((s) => s !== slug)
    .map(getSolutionBySlug)
    .filter((s): s is NonNullable<typeof s> => s != null);

  return (
    <>
      <BreadcrumbSchema
        baseUrl={baseUrl}
        items={[
          { name: "Início", href: "/" },
          { name: "Soluções", href: "/solucoes" },
          { name: solution.name, href: `/solucoes/${slug}` },
        ]}
      />
      <JsonLd data={faqSchema} />
      <JsonLd data={productSchema} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {Icon && (
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-8 w-8 text-primary" />
              </div>
            )}
            <Badge variant="secondary" className="mb-4">
              Solução
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              {solution.headline}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              {solution.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/register">
                  Começar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/restaurants">Ver exemplos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {solution.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            Como funciona
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Em 3 passos simples, seu restaurante começa a usar.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {solution.howItWorks.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            Por que usar {solution.name.toLowerCase()}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Vantagens reais para o dia a dia do seu restaurante.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {solution.benefits.map((benefit, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Dúvidas comuns sobre {solution.name.toLowerCase()}.
          </p>

          <div className="max-w-3xl mx-auto space-y-6">
            {solution.faq.map((item, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{item.question}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          {Icon && (
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <Icon className="h-8 w-8 text-primary-foreground" />
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto para implementar?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Comece a usar {solution.name.toLowerCase()} no seu restaurante hoje
            mesmo. Cadastro gratuito, sem compromisso.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">
              Começar gratuitamente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Related Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Related Personas */}
          {relatedPersonas.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-center mb-8">
                Ideal para
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {relatedPersonas.map((p) => (
                  <Button key={p.slug} asChild variant="outline">
                    <Link href={`/for/${p.slug}`}>
                      {p.icon} {p.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Other Solutions */}
          {otherSolutions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-8">
                Outras soluções
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {otherSolutions.map((s) => {
                  const SIcon = ICON_MAP[s.icon];
                  return (
                    <Button key={s.slug} asChild variant="outline">
                      <Link href={`/solucoes/${s.slug}`}>
                        {SIcon && <SIcon className="mr-2 h-4 w-4" />}
                        {s.name}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
