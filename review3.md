Ready to code?

Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Code Review — CrazyTemplate (Restaurant Platform)

Full review following CLAUDE.md guidelines. Each finding has a severity, file location, and suggested fix.

---

1.  Security (Red-Team Findings)

S1. users.add — autoApprove flag is client-controlled [HIGH]

File: packages/backend/convex/users.ts:47-80

Any authenticated user can call add({ autoApprove: true }) and bypass the approval workflow entirely. The mutation doesn't restrict who can set this flag.

Fix: Remove autoApprove arg from the public mutation. Instead, make auto-approve logic internal (e.g., auto-approve only when no users exist, or via an internal mutation).

S2. createCheckoutSession — Stripe URL returned to client without validation [HIGH]

File: packages/backend/convex/stripe.ts:194-229

session.url from Stripe is returned directly to the client. While the frontend validates it via isAllowedStripeUrl, a malicious client calling the Convex action directly bypasses the frontend
check. The action should validate the URL before returning.

Fix: Validate session.url against allowed Stripe hosts in the action itself, not only in the frontend hook.

S3. createBillingPortalSession — Same open redirect risk [MEDIUM]

File: packages/backend/convex/stripe.ts:266-297

session.url returned directly. Same issue as S2.

S4. discountPercentage unbounded in menu.createItem / menu.updateItem [MEDIUM]

File: packages/backend/convex/menu.ts:83-113, 135-173

No validation that discountPercentage is between 0 and 100. A malicious admin could set discountPercentage: 200, causing calculateDiscountedPrice to return price \* (1 - 200/100) = negative price.
Note: calculateDiscountedPrice in helpers.ts does guard > 100, but the field is stored raw and used elsewhere (e.g., customerOrders.ts:57-61 calculates inline without the guard).

Fix: Add discountPercentage arg to createItem/updateItem with validation 0 <= val <= 100. Also enforce in schema or at storage time.

S5. deliveryAddress — No max length validation [MEDIUM]

File: packages/backend/convex/customerOrders.ts:34-36

Only trim() check. A malicious user could send a multi-MB string. Convex has a 1MB document limit, but this could still cause storage/display issues.

Fix: Add args.deliveryAddress.length > 500 guard.

S6. generateUploadUrl — No file type/size restrictions [MEDIUM]

File: packages/backend/convex/files.ts:7-13

Any authenticated user can upload any file type. Could be abused for arbitrary file hosting.

Fix: At minimum, document this as accepted risk. Ideally, validate file type/size after upload in a post-upload mutation.

S7. deleteFile — No ownership check [MEDIUM]

File: packages/backend/convex/files.ts:22-28

Any authenticated user can delete any file by storage ID. A user could delete another restaurant's images.

Fix: Either remove the public deleteFile mutation, or add ownership verification (check if file is associated with user's resources).

S8. QR code URL — tableNumber not URL-encoded [LOW]

File: packages/backend/convex/tables.ts:324

const qrCode = `${args.baseUrl}/menu/${args.restaurantId}?table=${tableNumber}`;

tableNumber is currently always a number-string (from the loop), so this is safe in practice. But the schema allows any string for tableNumber, so a manual createTable call with tableNumber:
"1&admin=true" would inject query params.

Fix: Use encodeURIComponent(tableNumber) or new URLSearchParams.

S9. reorderCategories — No ownership check on individual categories [LOW]

File: packages/backend/convex/menu.ts:250-267

Checks restaurant access once, but patches categories by ID without verifying each category belongs to that restaurant. An admin could reorder categories from a different restaurant.

Fix: Validate category.restaurantId === args.restaurantId for each ID.

S10. No idempotency key for order creation [LOW]

Files: packages/backend/convex/orders.ts:61-151, customerOrders.ts:7-112

Network retries could create duplicate orders. Convex mutations are retried on OCC conflicts.

Fix: Accept an optional idempotencyKey arg and check for recent orders with the same key before inserting.

S11. canManageRestaurant — CEO has global access to all restaurants [INFO]

File: packages/backend/convex/lib/auth.ts:58-72

The function only checks SUPERADMIN for global access, but requireRestaurantAccess (used in tables, etc.) calls canManageRestaurant which only returns true for owner or superadmin. CEO isn't
explicitly handled — so CEO can only access restaurants they own. This is likely correct, but the isAdmin check in requireAdminRestaurantAccess combined with requireRestaurantAccess means a CEO
who doesn't own a restaurant gets "Access denied", not "Admin role required".

Fix: No code change needed, but document the intended behavior.

---

2.  Error Handling & Edge Cases

E1. getMyOrders — No pagination [MEDIUM]

File: packages/backend/convex/customerOrders.ts:114-158

Uses .collect() on all user orders, then sorts in-memory. For power users with hundreds of orders, this fetches everything. Combined with Promise.all for restaurant logos and order items, this
could be very slow or hit Convex query limits.

Fix: Use .paginate() or .take(50) with cursor-based pagination.

E2. getOrdersByRestaurant — No pagination [MEDIUM]

File: packages/backend/convex/orders.ts:8-58

Same issue — .collect() all orders, then Promise.all for all items.

E3. getTablesOverview — Loads ALL orders for restaurant [MEDIUM]

File: packages/backend/convex/tables.ts:91-96

Fetches all orders ever made at the restaurant just to group by table. For a restaurant with thousands of orders, this is expensive.

Fix: Filter by recent orders (e.g., last 24h) or use a status filter.

E4. getRecommendedProducts — Full table scan [LOW]

File: packages/backend/convex/customerMenu.ts:145-203

.collect() on all menu items via by_discount index, then filters in-memory. Scales linearly with total items across all restaurants.

Fix: Consider a compound index or limit the initial query.

E5. promoBanners.createBanner — URL validation catch swallows real errors [LOW]

File: packages/backend/convex/promoBanners.ts:42-49

The catch block catches both the new URL() error AND the "Invalid protocol" error, replacing the specific message with a generic one.

Fix: Separate the URL parsing try/catch from the protocol check.

---

3.  Readability

R1. use-toggle-favorite.ts — Side effect outside useEffect [LOW]

File: apps/web/hooks/use-toggle-favorite.ts:18-23

if (prevFavoritesRef.current !== favoritesKey) {
prevFavoritesRef.current = favoritesKey;
if (pendingToggles.size > 0) {
setPendingToggles(new Set()); // setState during render
}
}

This runs setPendingToggles during the render phase. While React 18+ technically supports this pattern for derived state, it's confusing and can cause an extra re-render. A useEffect would be
clearer per CLAUDE.md guidelines.

R2. getTablesOverview — 126 lines, hard to follow [LOW]

File: packages/backend/convex/tables.ts:41-127

This function fetches tables, carts, cart items, menu items, and orders, then zips them all together. It should be split into smaller helpers (e.g., fetchTableCarts, enrichCartItems).

---

4.  Performance

P1. Image URL resolution — N+1 pattern in multiple queries [MEDIUM]

Files:

- packages/backend/convex/customerMenu.ts:32-36 (per-item ctx.storage.getUrl)
- packages/backend/convex/customerMenu.ts:100-107 (related products)
- packages/backend/convex/customerOrders.ts:131-134 (per-order restaurant logo)

Each calls ctx.storage.getUrl individually inside a .map(). While Convex caches these internally, batching would be more explicit.

Fix: Collect all storage IDs first, batch-resolve, then map.

P2. useCart.totalItems recomputed every render [LOW]

File: apps/web/hooks/use-cart.ts:83

const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

Not memoized. Computed every render. Per CLAUDE.md, computed lists from arrays should use useMemo.

Fix: Wrap in useMemo with [items] dependency.

P3. Store homepage — 4 parallel queries with no Suspense [LOW]

File: apps/web/app/(store)/page.tsx:12-15

All 4 queries fire on mount. No loading skeleton or Suspense boundary. User sees empty page while loading.

Fix: Add loading state or skeleton UI.

---

5.  Styling & Design System

ST1. No issues found

All components use Tailwind classes, cn() for conditionals, and follow the design system. No inline style={} found.

---

6.  Code Repetition

CR1. Image URL resolution pattern duplicated 10+ times [MEDIUM]

Files: customerMenu.ts, customerOrders.ts, customerRestaurants.ts, promoBanners.ts, menu.ts

Pattern: item.imageId ? await ctx.storage.getUrl(item.imageId) : item.imageUrl ?? null

This exact pattern appears in nearly every query. resolveStorageUrl exists in files.ts but isn't used consistently.

Fix: Use resolveStorageUrl everywhere, and add a version that handles the ?? item.imageUrl fallback:
export async function resolveImageUrl(ctx, imageId?, legacyUrl?) {
return await resolveStorageUrl(ctx, imageId) ?? legacyUrl ?? null;
}

CR2. Discount price calculation duplicated [LOW]

Files: customerMenu.ts:39-42, customerMenu.ts:89-92, customerMenu.ts:114-117, customerMenu.ts:248-251, customerOrders.ts:58-61

Pattern: discountPercentage > 0 ? calculateDiscountedPrice(...) : price

Fix: Make calculateDiscountedPrice handle 0 gracefully (it already does — returns price when <= 0). Then just call calculateDiscountedPrice(item.price, item.discountPercentage ?? 0) without the
conditional.

CR3. linkUrl validation duplicated in promoBanners.ts [LOW]

File: packages/backend/convex/promoBanners.ts:39-51, 81-93

Identical URL validation block in createBanner and updateBanner.

Fix: Extract to validateLinkUrl(url: string) helper.

---

7.  Function Extraction

F1. getTablesOverview needs decomposition

File: packages/backend/convex/tables.ts:41-127

See R2. Extract cart enrichment and order grouping into helpers.

F2. Auth + permission pattern repeated manually in orders.ts

File: packages/backend/convex/orders.ts:11-23, 169-186

Manual getAuthenticatedUser + isRestaurantStaff + ownership check. This is exactly what requireRestaurantStaffAccess does.

Fix: Replace with await requireRestaurantStaffAccess(ctx, args.restaurantId).

---

8.  Console Logs

CL1. console.warn in stripe.ts — acceptable [OK]

File: packages/backend/convex/stripe.ts:68-70

Backend webhook handler, acceptable per CLAUDE.md.

CL2. No frontend console.log found [OK]

---

9.  Project Patterns

PP1. orders.createOrder doesn't use requireRestaurantStaffAccess [LOW]

File: packages/backend/convex/orders.ts:61-151

This mutation is session-based (no auth), which is correct for QR code flow. However, getOrdersByRestaurant and updateOrderStatus manually reimplement the staff auth check instead of using
requireRestaurantStaffAccess.

PP2. Currency format inconsistency [LOW]

- Backend helpers.ts:102-107: formatCurrency uses pt-BR / BRL / divides by 100 (cents)
- Frontend format.ts: formatCurrency uses en-US / USD (no division by 100)

These are different functions with the same name doing different things. Prices in the DB appear to be stored as whole units (not cents), making the backend helper wrong or unused.

Fix: Unify the currency format. If prices are in cents, divide by 100 everywhere. If in whole units, don't divide.

---

10. Overengineering

No significant overengineering found. The codebase is well-sized for its feature set.

---

11. Prop Drilling

PD1. cartOpen state in StoreLayout [LOW]

File: apps/web/app/(store)/layout.tsx:13

cartOpen/setCartOpen is passed from layout to StoreHeader (as onOpenCart) and CartDrawer. This is 1 level, which is fine per CLAUDE.md. However, any product page that wants to open the cart (e.g.,
"Add to cart" button) can't trigger it without lifting state further or using context.

Fix: Consider a cartOpenAtom in Jotai (already used for cart items) to allow any component to open the cart.

---

12. Re-renders

RR1. useCart.totalItems not memoized

See P2.

RR2. resolved object in useAuthRedirect recreated every render [LOW]

File: apps/web/hooks/use-auth-redirect.ts:54-60

The resolved options object is new every render, but its individual values are in the useEffect dep array, so this doesn't cause extra effect runs. Minor but could be cleaned up with useMemo.

---

13. Abstractions

No unnecessary abstractions found. The helper functions (resolveStorageUrl, calculateDiscountedPrice, validateSession, batch fetch functions) are all justified.

---

14. Dead Code

DC1. logoUrl on restaurants schema [LOW]

File: packages/backend/convex/schema.ts:64

Marked as deprecated in favor of logoId. Same for imageUrl on menuItems (line 113), menuCategories (line 100), foodCategories (line 217), promoBanners (line 252).

These are backward-compatibility fields. They should be cleaned up via migration if all data has been migrated.

DC2. isActive on restaurants schema [LOW]

File: packages/backend/convex/schema.ts:65

Both isActive (boolean) and status (active/maintenance/inactive) exist. isActive appears to be the legacy field replaced by status.

---

15. Unnecessary Casts

UC1. getAllUsers continueCursor cast [LOW]

File: packages/backend/convex/users.ts:143

continueCursor: "" as string,

Unnecessary — "" is already a string.

UC2. useToggleFavorite — id as Id<"restaurants"> [LOW]

File: apps/web/hooks/use-toggle-favorite.ts:34-35

result.push(id as Id<"restaurants">);

The pendingToggles Set stores string, but the IDs are originally Id<"restaurants">. The Set type should be Set<Id<"restaurants">> to avoid the cast.

---

Priority Summary
┌──────────┬───────┬────────────────────────────────────────────────────────┐
│ Severity │ Count │ Key Items │
├──────────┼───────┼────────────────────────────────────────────────────────┤
│ HIGH │ 2 │ S1 (autoApprove bypass), S2 (Stripe URL open redirect) │
├──────────┼───────┼────────────────────────────────────────────────────────┤
│ MEDIUM │ 8 │ S3-S7, E1-E3, CR1 │
├──────────┼───────┼────────────────────────────────────────────────────────┤
│ LOW │ 14 │ Remaining items │
├──────────┼───────┼────────────────────────────────────────────────────────┤
│ INFO │ 1 │ S11 │
└──────────┴───────┴────────────────────────────────────────────────────────┘
Files to Modify (ordered by priority)

1.  packages/backend/convex/users.ts — Remove/restrict autoApprove (S1)
2.  packages/backend/convex/stripe.ts — Validate Stripe URLs server-side (S2, S3)
3.  packages/backend/convex/menu.ts — Add discountPercentage validation (S4)
4.  packages/backend/convex/customerOrders.ts — Add deliveryAddress max length (S5), pagination (E1)
5.  packages/backend/convex/files.ts — Add ownership check to deleteFile (S7)
6.  packages/backend/convex/tables.ts — URL-encode tableNumber (S8), decompose getTablesOverview (R2, E3)
7.  packages/backend/convex/orders.ts — Use requireRestaurantStaffAccess (F2), pagination (E2)
8.  packages/backend/convex/lib/helpers.ts — Add resolveImageUrl helper (CR1)
9.  packages/backend/convex/promoBanners.ts — Extract URL validation helper (CR3)
10. apps/web/hooks/use-cart.ts — Memoize totalItems (P2)
11. apps/web/hooks/use-toggle-favorite.ts — Fix Set type (UC2), move setState to useEffect (R1)
12. apps/web/lib/format.ts — Unify currency format (PP2)

Verification

After applying fixes:

1.  pnpm check-types — Ensure no TypeScript errors
2.  pnpm lint — Ensure no lint errors
3.  npx convex dev — Verify Convex functions deploy without errors
4.  Manual test: Create a user without superadmin — verify autoApprove is no longer exploitable
5.  Manual test: Create a menu item — verify discount percentage is bounded 0-100
6.  Manual test: Place a delivery order — verify address length limit works
7.  Manual test: Checkout flow — verify Stripe URLs are validated server-side
