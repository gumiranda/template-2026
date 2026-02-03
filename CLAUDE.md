# Code Review Checklist

Todas as diretrizes abaixo devem ser seguidas ao escrever e revisar código neste projeto.

---

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

---

## Conditional logic — lookup objects e funções puras

Nunca usar ternários encadeados ou cadeias de `if/else if` inline para mapear valores.
Extrair a lógica para um **objeto de lookup** ou uma **função pura**.

```tsx
// RUIM
const label = isActive ? "Ativo" : isCanceled ? "Cancelado" : "Inativo";

// BOM — lookup object
const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: "Ativo", variant: "default" },
  canceled: { label: "Cancelado", variant: "destructive" },
};

function getStatusConfig(status: string | undefined) {
  return STATUS_CONFIG[status ?? ""] ?? { label: "Inativo", variant: "outline" };
}
```

```tsx
// RUIM — cadeia de if/else dentro de hook
useEffect(() => {
  let target = "";
  if (condA) target = "/a";
  else if (condB) target = "/b";
  if (target) router.push(target);
}, [deps]);

// BOM — função pura extraída
function resolveTarget(ctx: Context, opts: Options): string | false {
  if (!ctx.hasSuperadmin && opts.whenNoSuperadmin) return opts.whenNoSuperadmin;
  if (ctx.user?.status === "pending" && opts.whenPending) return opts.whenPending;
  return false;
}

useEffect(() => {
  const target = resolveTarget({ user, hasSuperadmin }, opts);
  if (target) router.push(target);
}, [deps]);
```

---

## Readability

- Funções acima de ~40 linhas devem ser divididas em funções menores com nomes descritivos.
- Nenhum componente React deve ultrapassar ~300 linhas. Dividir em subcomponentes.
- Nomear magic numbers como constantes no topo do arquivo.

```tsx
// RUIM
{order.items.slice(0, 3).map(/* ... */)}
{order.items.length > 3 && <p>+{order.items.length - 3} itens</p>}

// BOM
const MAX_VISIBLE_ITEMS = 3;
{order.items.slice(0, MAX_VISIBLE_ITEMS).map(/* ... */)}
{order.items.length > MAX_VISIBLE_ITEMS && <p>+{order.items.length - MAX_VISIBLE_ITEMS} itens</p>}
```

---

## Error handling & edge cases

- Nunca usar non-null assertions (`!`) após operações assíncronas. Sempre fazer null check explícito.
- Validar inputs no backend: ranges numéricos, limites de array, formatos de string.
- URLs recebidas do backend devem ser validadas antes de atribuir a `window.location.href`.

```tsx
// RUIM
const cart = (await ctx.db.get(cartId))!;

// BOM
const cart = await ctx.db.get(cartId);
if (!cart) throw new Error("Cart not found");
```

```tsx
// RUIM — open redirect
const url = await createCheckout();
if (url) window.location.href = url;

// BOM — validar domínio
function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ALLOWED_HOSTS.includes(parsed.hostname);
  } catch { return false; }
}
if (url && isAllowedUrl(url)) window.location.href = url;
```

---

## Performance

- Usar `next/image` `<Image>` ao invés de `<img>` para imagens externas/dinâmicas. Configurar `remotePatterns` em `next.config.mjs`.
- Nunca colocar side effects dentro de `useMemo`. Usar `useEffect`.
- Memoizar listas computadas com `useMemo` quando recalculadas a cada render.
- Funções instáveis de `useAction`/`useMutation` não devem entrar no dependency array de `useEffect` — usar `// eslint-disable-next-line react-hooks/exhaustive-deps`.
- `Promise.all` com grande volume (100+) deve usar batching para evitar sobrecarga.

```tsx
// RUIM — side effect em useMemo
useMemo(() => {
  if (items[0]) setSelected(items[0]._id);
}, [items]);

// BOM
useEffect(() => {
  if (items[0]) setSelected(items[0]._id);
}, [items]);
```

---

## Styling

- Usar apenas classes Tailwind do design system (`@workspace/ui`). Nunca CSS inline (`style={}`).
- Nunca duplicar patterns visuais. Se um pattern de imagem com fallback aparece 3+ vezes, extrair para componente.
- Usar `cn()` de `@workspace/ui/lib/utils` para classes condicionais.

---

## Code repetition

- Lógica duplicada 2+ vezes deve ser extraída para:
  - **Componente** se é UI (ex: `ImageWithFallback`).
  - **Hook** se é state + lógica (ex: `useFormDialog`).
  - **Função utilitária** se é pura (ex: `validateUrl`).
- Validações repetidas no backend devem ser extraídas para helpers em `lib/`.

---

## Function extraction

- Handlers de formulário com validação + submit + error handling devem ser extraídos para hooks.
- Lógica de resolução condicional (redirect, status mapping, permissions) deve ser função pura separada do componente/hook.
- Funções de geração (QR codes, PDFs) devem ser utilitários separados, não inline em componentes.

---

## Console logs

- Nenhum `console.log` ou `console.error` em código de produção frontend.
- Usar `toast` (sonner) para erros visíveis ao usuário.
- `.catch(() => {})` para erros silenciosos intencionais, com comentário justificando.
- `console.warn`/`console.log` são aceitáveis em seed scripts e webhook handlers do backend.

---

## Project patterns

- Backend (Convex): mutations são transacionais. Não precisa de try/catch para rollback — se throw, tudo reverte.
- Auth: usar `getAuthenticatedUser()` + `isRestaurantStaff()` / `requireRestaurantAccess()` de `lib/auth.ts`.
- Sessions (QR code flow): são anônimas. O `sessionId` (UUID v4) é o token de autorização. Não possuem `userId`.
- Store images: usar `resolveStorageUrl()` de `files.ts` para resolver `imageId` → URL.
- Não introduzir novos patterns (state management, fetching, auth) sem discussão prévia.

---

## Overengineering

- Não criar abstrações para uso único. Três linhas repetidas é melhor que uma abstração prematura.
- Não adicionar feature flags, backward compatibility, ou configurabilidade extra que não foi pedida.
- Não adicionar error handling para cenários impossíveis no contexto interno.
- Se a solução tem mais código que o problema, está errada.

---

## Prop drilling

- Se um prop passa por 3+ níveis sem ser usado nos intermediários, criar Context + hook.
- State de UI global (cart drawer open, theme) deve usar Context ou atoms (jotai).
- Props de dados (restaurant, order) podem ser passados 1-2 níveis sem problema.

---

## Maintainability

- Componentes acima de ~500 linhas devem ser divididos (ex: separar `TableGrid`, `TableFilters`, `BatchActionsPanel`).
- Arquivos de mutation/query do Convex devem agrupar por domínio (orders, carts, menu), não por tipo.
- Cada hook deve ter uma responsabilidade clara. Se faz auth + redirect + fetch, dividir.

---

## Re-renders

- Listas computadas de arrays devem usar `useMemo`.
- Callbacks passados como props devem usar `useCallback`.
- Refs (`useRef`) para guards de redirect, não state (`useState`) — state causa re-render.
- Nunca criar objetos/arrays inline em props de componentes filhos sem memoizar.

```tsx
// RUIM — novo objeto a cada render
<Child config={{ threshold: 10 }} />

// BOM — constante ou memoizado
const CONFIG = { threshold: 10 };
<Child config={CONFIG} />
```

---

## Abstractions

- Só criar abstração quando existe duplicação real (3+ usos) ou complexidade que justifique.
- Hooks genéricos (`useFormDialog<T>`) só se houver 3+ dialogs com o mesmo pattern.
- Não criar wrappers em torno de bibliotecas (Convex, Clerk) que só repassam chamadas.

---

## Dead code

- Remover imports, variáveis, props e funções não utilizadas após cada mudança.
- Não deixar código comentado. Usar git history.
- Tipos com valor único (`Sector = { GENERAL: "general" }`) devem ser removidos se a funcionalidade nunca foi expandida.

---

## Unnecessary casts

- Não usar `as Type` após validação que já garante o tipo. Usar type guards.
- `NonNullable<typeof r>` com `.filter()` é necessário em TypeScript (`.filter(Boolean)` não faz narrowing).
- Não anotar tipos que o TypeScript já infere do return type ou contexto.

```tsx
// RUIM — cast desnecessário após validação
if (!isValidId(id)) return;
const restaurantId = id as Id<"restaurants">; // id já é validado

// BOM — type guard na validação
function isValidRestaurantId(id: string): id is Id<"restaurants"> {
  return CONVEX_ID_REGEX.test(id);
}
```

---

## Security

Ao revisar qualquer feature, agir como red-team pen-tester:

- **Input validation**: Todo `v.string()` e `v.number()` do Convex deve ter validação de range/formato no handler.
  - `quantity` → `> 0 && Number.isInteger()`
  - `price` → `> 0`
  - `url` → `new URL()` + check de protocol `https:`/`http:`
  - arrays → limite de tamanho (`items.length > 100`)
  - `priceId` → validar prefixo `price_`
- **URL injection**: Nunca construir URLs com input do usuário sem validar (previne `javascript:` em QR codes, links, redirects).
- **Open redirect**: URLs do backend atribuídas a `window.location.href` devem ser validadas contra whitelist de domínios.
- **Security headers**: Middleware deve incluir `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Permissions**: Toda mutation/query que acessa dados de um restaurant deve verificar ownership (`restaurant.ownerId === user._id` ou `SUPERADMIN`).
- **Session security**: Sessions expiradas não devem permitir operações destrutivas. Justificar com comentário quando `checkExpiry: false` é intencional.
