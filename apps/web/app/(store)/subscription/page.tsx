"use client";

import { SubscriptionCard } from "@/components/store/subscription-card";

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Minha assinatura</h1>
      <div className="max-w-md">
        <SubscriptionCard />
      </div>
    </div>
  );
}
