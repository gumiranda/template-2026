## Navigation

Never use `<Button onClick={() => router.push("/path")}>` for navigation links.
Always use `next/link` `<Link>` component instead. When you need a Button that navigates, use the `asChild` pattern:

```tsx
<Button asChild variant="outline">
  <Link href="/path">
    <Icon className="mr-2 h-4 w-4" />
    Label
  </Link>
</Button>
```

This ensures proper prefetching, accessibility (renders as `<a>`), and follows Next.js best practices.
Reserve `router.push()` only for programmatic navigation after async operations (e.g., after form submission, after mutation completes).

## Conditional logic — prefer lookup objects and functions

Never use ternários encadeados ou cadeias de `if/else if` inline para mapear valores.
Extrair a lógica para um **objeto de lookup** ou uma **função pura** que recebe os dados e retorna o resultado.

### Ruim — ternário encadeado inline

```tsx
const label = isActive
  ? "Ativo"
  : isCanceled
    ? "Cancelado"
    : isPastDue
      ? "Pendente"
      : "Inativo";
```

### Ruim — cadeia de if/else inline dentro de hook/effect

```tsx
useEffect(() => {
  let target = "";
  if (condA) {
    target = "/a";
  } else if (condB) {
    target = "/b";
  } else if (condC) {
    target = "/c";
  }
  if (target) router.push(target);
}, [deps]);
```

### Bom — lookup object

```tsx
const STATUS_LABELS: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: "Ativo", variant: "default" },
  canceled: { label: "Cancelado", variant: "destructive" },
  past_due: { label: "Pendente", variant: "secondary" },
};
const DEFAULT_STATUS = { label: "Inativo", variant: "outline" as BadgeVariant };

function getStatusConfig(status: string | undefined) {
  if (!status) return DEFAULT_STATUS;
  return STATUS_LABELS[status] ?? DEFAULT_STATUS;
}

// uso:
const config = getStatusConfig(subscription?.status);
```

### Bom — função pura para decisão complexa

```tsx
function resolveRedirectTarget(ctx: RedirectContext, opts: ResolvedOptions): string | false {
  if (ctx.hasSuperadmin === false && opts.whenNoSuperadmin) return opts.whenNoSuperadmin;
  if (ctx.currentUser === null && opts.whenNoUser) return opts.whenNoUser;
  if (ctx.currentUser?.status === "pending" && opts.whenPending) return opts.whenPending;
  return false;
}

// uso no hook:
useEffect(() => {
  const target = resolveRedirectTarget({ currentUser, hasSuperadmin }, opts);
  if (target) router.push(target);
}, [deps]);
```

Isso facilita testes unitários, mantém os componentes limpos e evita lógica condicional enterrada no JSX ou em effects.
