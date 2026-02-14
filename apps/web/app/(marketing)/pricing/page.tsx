import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out and small projects.",
    features: [
      "Up to 3 team members",
      "1,000 API requests/month",
      "Basic analytics",
      "Community support",
      "1 project",
    ],
    cta: "Get Started",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Best for growing teams and businesses.",
    features: [
      "Up to 20 team members",
      "50,000 API requests/month",
      "Advanced analytics",
      "Priority email support",
      "10 projects",
      "Custom integrations",
      "API access",
    ],
    cta: "Start Free Trial",
    href: "/sign-up",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large organizations with advanced needs.",
    features: [
      "Unlimited team members",
      "Unlimited API requests",
      "Real-time analytics",
      "24/7 dedicated support",
      "Unlimited projects",
      "Custom integrations",
      "SSO / SAML",
      "SLA guarantee",
      "Audit logs",
    ],
    cta: "Contact Sales",
    href: "/sign-up",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular
                  ? "relative border-primary shadow-lg scale-[1.02]"
                  : "border"
              }
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            All plans include SSL, 99.9% uptime SLA, and GDPR compliance.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Need a custom plan?{" "}
            <Link href="#" className="text-primary underline hover:no-underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
