"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useCallback, useState } from "react";

const ALLOWED_STRIPE_HOSTS = [
  "checkout.stripe.com",
  "billing.stripe.com",
];

function isAllowedStripeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      ALLOWED_STRIPE_HOSTS.some(
        (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
      )
    );
  } catch {
    return false;
  }
}

export function useSubscription() {
  const subscriptionData = useQuery(api.stripe.getSubscriptionStatus);
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const createPortal = useAction(api.stripe.createBillingPortalSession);
  const [isLoading, setIsLoading] = useState(false);

  const startCheckout = useCallback(
    async (priceId?: string) => {
      setIsLoading(true);
      try {
        const url = await createCheckout({ priceId });
        if (url && isAllowedStripeUrl(url)) {
          window.location.href = url;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [createCheckout]
  );

  const openBillingPortal = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = await createPortal();
      if (url && isAllowedStripeUrl(url)) {
        window.location.href = url;
      }
    } finally {
      setIsLoading(false);
    }
  }, [createPortal]);

  const isActive = subscriptionData?.status === "active";
  const isCanceled = subscriptionData?.status === "canceled";
  const isPastDue = subscriptionData?.status === "past_due";

  return {
    subscriptionData,
    isActive,
    isCanceled,
    isPastDue,
    isLoading,
    startCheckout,
    openBillingPortal,
  };
}
