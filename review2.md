CRITICAL — Security & Permissions

1.  customerOrders.ts:19-34 — Missing price validation on order creation

createDeliveryOrder aceita items do client sem revalidar preços no servidor. Um atacante pode manipular price no payload.
Fix: Sempre buscar o preço do menuItem no DB no momento da criação.

2.  carts.ts:111 — Unchecked non-null assertion

cart = (await ctx.db.get(cartId))! assume que o cart existe. Race condition pode causar crash.
Fix: Adicionar null check com early return/throw.

3.  sessions.ts:124-125 — Expired sessions can clear carts

clearSessionCart chama validateSession com checkExpiry: false. Sessions expiradas ainda podem manipular carts.
Fix: Exigir checkExpiry: true ou justificar a exceção com comentário.

4.  orders.ts:61-148 — Session ownership not validated

createOrder valida a session mas não verifica se o USUÁRIO atual é o dono da session. Alguém com session ID alheio pode criar pedidos.
Fix: Validar que session.userId === currentUser.\_id.

5.  tables.ts:277-279 — XSS via baseUrl

baseUrl: v.string() aceita qualquer string sem validar formato URL. Valor como javascript:alert(1) pode ser injetado no QR code.
Fix: Validar com regex de URL ou usar new URL() com try/catch.

6.  rejected/page.tsx:49-56 — XSS via rejection reason

rejectionReason exibido sem sanitização. Se vier de input de admin, pode conter HTML/JS malicioso.
Fix: Escapar conteúdo ou usar textContent pattern do React (já seguro se usado via JSX {text}, mas confirmar que não usa dangerouslySetInnerHTML).

7.  use-subscription.ts:18,30 — Open redirect via window.location.href

URLs retornadas do backend atribuídas diretamente a window.location.href sem validar domínio.
Fix: Validar que URL começa com https://checkout.stripe.com ou domínio esperado.

8.  middleware.ts — Missing security headers & rate limiting

Sem headers de segurança (CSP, X-Frame-Options, etc). Sem rate limiting em rotas de auth.
Fix: Adicionar headers via NextResponse e considerar rate limiting no middleware.

---

HIGH — Input Validation

9.  carts.ts:65,96 / sessions.ts:77 — Quantity aceita negativos/decimais/Infinity

quantity: v.number() sem range validation. Permite quantity: -5 ou quantity: 0.001.
Fix: Validar quantity > 0 && Number.isInteger(quantity) no handler.

10. menu.ts:88-91 — Price aceita negativos

price: v.number() sem validação > 0.
Fix: if (price <= 0) throw new Error(...).

11. orders.ts:66-72 — Items array sem limite de tamanho

Pode criar pedido com 10.000+ items.
Fix: if (items.length > MAX_ITEMS) throw....

12. stripe.ts:209 — priceId sem validação de formato

priceId: v.optional(v.string()) aceita qualquer string.
Fix: Validar formato price\_ prefix.

13. promoBanners.ts:25-30 — linkUrl sem validação

linkUrl: v.optional(v.string()) pode ser javascript: protocol.
Fix: Validar URL format.

14. tables.ts:284-292 — startId permite 0

Validação start < 1 mas permite start === 0 se parsing falhar.
Fix: Usar Number.isInteger() e >= 1 check robusto.

---

HIGH — Error Handling

15. customerOrders.ts:39-73 — Promise.all sem try-catch

Se qualquer item falhar no meio, order items órfãos ficam no DB.
Fix: Wrap em transaction ou adicionar cleanup no catch.

16. orders.ts:101-119 — Mesmo problema com Promise.all

Items órfãos se a criação falhar no meio.

17. success/page.tsx:17-23 — useEffect com dependency instável

syncAfterSuccess de useAction cria nova referência a cada render, causando loop infinito potencial.
Fix: Remover syncAfterSuccess do dependency array:
useEffect(() => {
if (sessionId && !synced) {
syncAfterSuccess({ sessionId }).then(() => setSynced(true)).catch(console.error);
}
}, [sessionId, synced]); // remover syncAfterSuccess

18. stripe.ts:89 — pm.card.brand sem null check

pm.card pode ser undefined se payment method não for cartão.
Fix: pm?.card?.brand.

19. use-auth-redirect.ts:41-63 — Redirect race conditions

Múltiplos redirects no mesmo effect. Mudanças rápidas de estado causam loops.
Fix: Adicionar guard com redirected ref.

20. menu/page.tsx:171-176 — Side effect dentro de useMemo

setSelectedCategoryId chamado dentro de useMemo. Deve ser useEffect.
Fix: Mover para useEffect.

---

HIGH — Performance

21. tables/page.tsx (1146 linhas) / menu/page.tsx (873 linhas) — Componentes gigantes

Difíceis de manter, testear, e causam re-renders desnecessários.
Fix: Dividir em componentes menores:

- TableGenerationForm, TableFilters, TableGrid, BatchActionsPanel
- MenuSidebar, MenuItemsGrid, CategoryDialog, ItemDialog

22. tables/page.tsx:398-427 — Promise.all sem concurrency limit

100+ QR codes gerados simultaneamente podem crashar o browser.
Fix: Usar batching (e.g., 10 em paralelo).

23. tables/page.tsx:436-495 — PDF generation na main thread

Freeze de UI durante geração de PDFs grandes.
Fix: Mover para Web Worker.

24. Múltiplos componentes store — <img> ao invés de next/image

restaurant-card.tsx, product-card.tsx, product-details.tsx, etc usam <img> raw.
Fix: Substituir por Image de next/image para otimização automática.

25. use-toggle-favorite.ts:26-36 — Lista otimista sem memoização

Recalculada a cada render.
Fix: Usar useMemo.

---

MEDIUM — Code Repetition

26. Image fallback pattern repetido 8+ vezes

restaurant-card, product-card, product-details, order-card, etc.
Fix: Criar componente ImageWithFallback.

27. tenants/page.tsx:418-500 — Create/Edit handlers quase idênticos

Validação e error handling duplicados.
Fix: Extrair useRestaurantForm hook.

28. menu/page.tsx:202-384 — Dialog handlers duplicados

Category e item modals seguem pattern idêntico.
Fix: Extrair useFormDialog hook genérico.

29. Search logic duplicado em 3 arquivos

restaurants/page.tsx, store-header.tsx, hero-section.tsx.
Fix: Extrair useSearch hook.

30. QR code render logic duplicado

handleDownloadQR e handlePrintAll em tables/page.tsx.
Fix: Extrair generateQRImage utility.

31. Skeleton loading pattern repetido

restaurant-list, category-list, product-list, products/recommended.
Fix: Criar SkeletonGrid component.

32. use-subscription.ts:13-34 — try-finally duplicado

startCheckout e openBillingPortal são quase idênticos.
Fix: Extrair helper executeStripeAction.

---

MEDIUM — Prop Drilling & State

33. Cart drawer state prop-drilled do layout

layout.tsx → StoreHeader → CartDrawer via props.
Fix: Criar CartDrawerContext com hook useCartDrawer.

---

MEDIUM — Unnecessary Casts

34. customerMenu.ts:200-201 / customerRestaurants.ts:191-192

r is NonNullable<typeof r> verboso — TypeScript infere com .filter(Boolean).

35. stripe.ts:203

: string type annotation desnecessária — TS infere do return type.

36. tenants/page.tsx:449,627

Non-null casts após filter que já garante non-null.

37. menu/page.tsx:343,350,378

as Id<"menuCategories"> após validação.

38. tables/page.tsx:247,341,378

Mesmos casts desnecessários após validação.

---

MEDIUM — Dead Code

39. lib/helpers.ts:12-14 — isValidConvexId no backend

Definida mas usada apenas no frontend. Verificar se export é necessário.

40. seed.ts:3-70 — Funções duplicadas

seedFoodCategories e seedPromoBanners existem como standalone E dentro de runFullSeed.

41. product-card.tsx:18 — restaurantId prop não utilizado

Definido na interface mas nunca usado no componente.

42. lib/types.ts:1-3 — Sector com valor único

Sector object com apenas "general" — funcionalidade incompleta ou desnecessária.

---

LOW — Styling & Readability

43. Magic numbers espalhados

order-card.tsx:64 .slice(0, 3), skeleton counts hardcoded.
Fix: Extrair para constantes nomeadas.

44. subscription-card.tsx:20-34 — Ternários aninhados

Status label com 4 níveis de ternário.
Fix: Extrair para getSubscriptionStatusLabel() ou usar objeto de lookup.

45. restaurants/[id]/page.tsx:116-156 — Duplo loop em categories

categories.map() chamado 2x (TabsTrigger + TabsContent).
Fix: Single map retornando tuple ou refatorar estrutura.

---

LOW — Console Logs

46. success/page.tsx:21 — .catch(console.error)

Debug-level logging em produção.
Fix: Substituir por toast ou proper error handler.

---

Verificação

Após implementar fixes:

1.  pnpm build — sem erros de compilação
2.  pnpm lint — sem warnings novos
3.  Testar fluxo completo: criar restaurant → menu → tables → QR → order
4.  Testar auth: register → pending → approve → dashboard
5.  Testar store: browse → add to cart → checkout
6.  Pen-test: tentar acessar admin endpoints sem auth, manipular preços, session hijacking
