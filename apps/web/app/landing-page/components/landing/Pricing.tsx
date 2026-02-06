import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small cafes and new restaurants",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "1 restaurant location",
      "Up to 50 menu items",
      "Basic QR code generation",
      "Standard digital menu",
      "Email support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    description: "For growing restaurants with high demand",
    monthlyPrice: 89,
    yearlyPrice: 71,
    features: [
      "Up to 3 restaurant locations",
      "Unlimited menu items",
      "Custom branded QR codes",
      "Kitchen display system",
      "Real-time analytics",
      "Multi-cart system",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For franchises and restaurant chains",
    monthlyPrice: 199,
    yearlyPrice: 159,
    features: [
      "Unlimited locations",
      "Unlimited menu items",
      "White-label solution",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom reporting",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium text-primary mb-2">
            PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your restaurant's needs. All plans include 
            a 14-day free trial with no credit card required.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-4 bg-card rounded-full p-2 border">
            <span
              className={`text-sm font-medium px-3 ${
                !isYearly ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span
              className={`text-sm font-medium px-3 ${
                isYearly ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Yearly
              <span className="ml-1 text-xs text-primary">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card rounded-2xl p-8 border shadow-sm hover:shadow-lg transition-all duration-300 ${
                plan.popular ? "border-primary ring-2 ring-primary/20" : ""
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
                {isYearly && plan.monthlyPrice > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Billed annually
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
