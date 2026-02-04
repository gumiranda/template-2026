"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Check } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@workspace/ui/lib/utils";

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  priceId?: string;
  highlighted?: boolean;
}

export function PricingCard({
  title,
  price,
  features,
  priceId,
  highlighted = false,
}: PricingCardProps) {
  const { isActive, isLoading, startCheckout } = useSubscription();

  return (
    <Card
      className={cn(
        "relative",
        highlighted && "border-primary shadow-lg"
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-3xl font-bold">{price}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        {priceId && !isActive && (
          <Button
            className="w-full"
            variant={highlighted ? "default" : "outline"}
            onClick={() => startCheckout(priceId)}
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Assinar"}
          </Button>
        )}
        {isActive && (
          <Button className="w-full" variant="outline" disabled>
            Plano atual
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
