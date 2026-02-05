import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowRight, Quote } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { getPersonaBySlug, getAllPersonaSlugs } from "@/lib/data/personas";
import { BreadcrumbSchema, JsonLd } from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Food Delivery";

interface PageProps {
  params: Promise<{ persona: string }>;
}

export async function generateStaticParams() {
  return getAllPersonaSlugs().map((persona) => ({ persona }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { persona: slug } = await params;
  const persona = getPersonaBySlug(slug);

  if (!persona) {
    return { title: "Página não encontrada" };
  }

  const title = `Sistema de pedidos para ${persona.name} | ${siteName}`;
  const description = persona.description;

  return {
    title,
    description,
    keywords: persona.keywords,
    alternates: {
      canonical: `/for/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/for/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const VALID_SLUG_REGEX = /^[a-z0-9-]+$/;

export default async function PersonaPage({ params }: PageProps) {
  const { persona: slug } = await params;

  if (!VALID_SLUG_REGEX.test(slug)) {
    notFound();
  }

  const persona = getPersonaBySlug(slug);

  if (!persona) {
    notFound();
  }

  // FAQ Schema for rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Qual o melhor sistema de pedidos para ${persona.singular.toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${siteName} é uma excelente opção para ${persona.name.toLowerCase()}. ${persona.description}`,
        },
      },
      {
        "@type": "Question",
        name: `Como funciona o sistema de pedidos para ${persona.name.toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Com ${siteName}, sua ${persona.singular.toLowerCase()} pode receber pedidos online de delivery e mesa. ${persona.solutions.slice(0, 2).join(" ")}`,
        },
      },
      {
        "@type": "Question",
        name: `Quais funcionalidades são importantes para ${persona.name.toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: persona.keyFeatures.join(", "),
        },
      },
    ],
  };

  // Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${siteName} para ${persona.name}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    description: persona.description,
    offers: {
      "@type": "Offer",
      price: "49",
      priceCurrency: "BRL",
    },
  };

  return (
    <>
      <BreadcrumbSchema
        baseUrl={baseUrl}
        items={[
          { name: "Início", href: "/" },
          { name: "Para quem", href: "/for/pizzarias" },
          { name: persona.name, href: `/for/${slug}` },
        ]}
      />
      <JsonLd data={faqSchema} />
      <JsonLd data={productSchema} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-6xl mb-6">{persona.icon}</div>
            <Badge variant="secondary" className="mb-4">
              Para {persona.name}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              {persona.headline}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              {persona.subheadline}
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

      {/* Pain Points Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            Desafios que você conhece bem
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Se você tem uma {persona.singular.toLowerCase()}, provavelmente já
            passou por isso:
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {persona.painPoints.map((pain, i) => (
              <Card key={i} className="border-dashed">
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <span className="text-destructive">😫</span>
                  </div>
                  <p className="text-sm">{pain}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            Como {siteName} resolve
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Desenvolvemos funcionalidades pensando especificamente em{" "}
            {persona.name.toLowerCase()}.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {persona.solutions.map((solution, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm">{solution}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            Funcionalidades para {persona.name}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Tudo que sua {persona.singular.toLowerCase()} precisa para receber
            pedidos online.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {persona.keyFeatures.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg border bg-card"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <Quote className="h-10 w-10 text-primary/20 mb-4" />
              <blockquote className="text-lg md:text-xl mb-6">
                &ldquo;{persona.useCase.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {persona.useCase.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{persona.useCase.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {persona.useCase.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="text-5xl mb-6">{persona.icon}</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto para modernizar sua {persona.singular.toLowerCase()}?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Junte-se a centenas de {persona.name.toLowerCase()} que já usam{" "}
            {siteName}.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">
              Começar gratuitamente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Related Personas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Também funciona para
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {getAllPersonaSlugs()
              .filter((s) => s !== slug)
              .slice(0, 4)
              .map((s) => {
                const p = getPersonaBySlug(s);
                if (!p) return null;
                return (
                  <Button key={s} asChild variant="outline">
                    <Link href={`/for/${s}`}>
                      {p.icon} {p.name}
                    </Link>
                  </Button>
                );
              })}
          </div>
        </div>
      </section>
    </>
  );
}
