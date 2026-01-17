# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Subscription Management

This project uses a custom Stripe-based subscription system for premium feature access control. The system is decoupled from authentication (Clerk) and provides flexible, organization-level subscription management.

### Key Features

- Organization-level subscriptions (team billing)
- Real-time subscription status updates via Convex
- Client and server-side authorization components
- Automatic access control for premium features

### Quick Start

Protect premium features with the `SubscriptionProtect` component:

```tsx
import { SubscriptionProtect } from "@/components/subscription-protect";

<SubscriptionProtect fallback={<UpgradePrompt />}>
  <PremiumFeature />
</SubscriptionProtect>;
```

Access subscription status in components:

```tsx
import { useSubscription } from "@/hooks/use-subscription";

const { hasActiveSubscription, tier, isLoading } = useSubscription();
```

### Documentation

For complete documentation on the subscription system, see:

- [Migration Guide](./.kiro/specs/stripe-billing-migration/MIGRATION_GUIDE.md) - Complete developer guide with examples
- [Design Document](./.kiro/specs/stripe-billing-migration/design.md) - Technical architecture
- [Requirements](./.kiro/specs/stripe-billing-migration/requirements.md) - Feature requirements
