"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { CreditCard, ExternalLink } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: "Ativo", variant: "default" },
  canceled: { label: "Cancelado", variant: "destructive" },
  past_due: { label: "Pagamento pendente", variant: "secondary" },
};

const DEFAULT_STATUS = { label: "Inativo", variant: "outline" as BadgeVariant };

function getStatusConfig(status: string | undefined) {
  if (!status) return DEFAULT_STATUS;
  return STATUS_CONFIG[status] ?? DEFAULT_STATUS;
}

export function SubscriptionCard() {
  const {
    subscriptionData,
    isActive,
    isPastDue,
    isLoading,
    startCheckout,
    openBillingPortal,
  } = useSubscription();

  const statusConfig = getStatusConfig(subscriptionData?.status);

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
          <Badge variant={statusConfig.variant}>
            {statusConfig.label}
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
