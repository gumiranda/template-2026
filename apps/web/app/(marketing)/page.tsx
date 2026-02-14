import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  BarChart3,
  CreditCard,
  Globe,
  Lock,
  Sparkles,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Authentication",
    description:
      "Clerk-powered auth with sign-up, sign-in, SSO, and user management out of the box.",
  },
  {
    icon: CreditCard,
    title: "Subscription Billing",
    description:
      "Pricing tiers, plan management, and billing settings ready to connect to Stripe.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Beautiful charts and KPIs to track revenue, users, and engagement metrics.",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Role-based access control with superadmin, CEO, and user roles built in.",
  },
  {
    icon: Globe,
    title: "Real-time Backend",
    description:
      "Convex serverless backend with real-time data sync and type-safe queries.",
  },
  {
    icon: Lock,
    title: "Enterprise Ready",
    description:
      "User approval workflows, permissions system, and audit-ready architecture.",
  },
];

const testimonials = [
  {
    quote:
      "This starter kit saved us weeks of setup. We launched our MVP in days instead of months.",
    author: "Sarah Chen",
    role: "CTO, TechFlow",
    stars: 5,
  },
  {
    quote:
      "The best SaaS template I've used. Clean code, great DX, and production-ready from day one.",
    author: "Marcus Johnson",
    role: "Founder, DataPulse",
    stars: 5,
  },
  {
    quote:
      "Incredible value. Auth, billing, dashboard - everything just works. Highly recommended.",
    author: "Ana Silva",
    role: "Lead Dev, Cloudify",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="mr-1 h-3 w-3" />
              Production-ready SaaS Starter Kit
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Ship your SaaS
              <span className="block text-primary">10x faster</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Stop wasting time on boilerplate. Get auth, billing, dashboards, and
              more - all pre-built with Next.js, Convex, and Clerk. Focus on what
              makes your product unique.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. Start building in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to launch
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              A complete SaaS foundation so you can focus on building your core
              product, not infrastructure.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border bg-background">
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Tech Stack</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built with modern tools
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Best-in-class technologies for performance, developer experience, and scalability.
            </p>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Next.js 15", desc: "React framework with App Router" },
              { name: "Convex", desc: "Real-time serverless backend" },
              { name: "Clerk", desc: "Authentication & user management" },
              { name: "Shadcn/UI", desc: "50+ accessible components" },
              { name: "TypeScript", desc: "End-to-end type safety" },
              { name: "Tailwind CSS", desc: "Utility-first styling" },
              { name: "Turborepo", desc: "Monorepo build system" },
              { name: "Framer Motion", desc: "Smooth animations" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="rounded-lg border bg-background p-4 text-center"
              >
                <p className="font-semibold">{tech.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by developers
            </h2>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.author} className="border bg-background">
                <CardContent className="pt-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to ship your SaaS?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of developers building with SaaSKit. Get started in
            minutes, not months.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Start Building Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">Compare Plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
