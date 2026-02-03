"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { CreditCard, ExternalLink } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

export function SubscriptionCard() {
  const {
    subscriptionData,
    isActive,
    isCanceled,
    isPastDue,
    isLoading,
    startCheckout,
    openBillingPortal,
  } = useSubscription();

  const statusLabel = isActive
    ? "Ativo"
    : isCanceled
      ? "Cancelado"
      : isPastDue
        ? "Pagamento pendente"
        : "Inativo";

  const statusVariant = isActive
    ? "default"
    : isCanceled
      ? "destructive"
      : isPastDue
        ? "secondary"
        : ("outline" as const);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={statusVariant as "default" | "secondary" | "destructive" | "outline"}>
            {statusLabel}
          </Badge>
        </div>

        {subscriptionData?.paymentMethodBrand && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Forma de pagamento
            </span>
            <span className="text-sm font-medium">
              {subscriptionData.paymentMethodBrand.toUpperCase()} ****
              {subscriptionData.paymentMethodLast4}
            </span>
          </div>
        )}

        {subscriptionData?.currentPeriodEnd && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {subscriptionData.cancelAtPeriodEnd
                ? "Expira em"
                : "Próxima cobrança"}
            </span>
            <span className="text-sm">
              {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString(
                "pt-BR"
              )}
            </span>
          </div>
        )}

        {isActive || isPastDue ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={openBillingPortal}
            disabled={isLoading}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Gerenciar assinatura
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => startCheckout()}
            disabled={isLoading}
          >
            Assinar agora
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
