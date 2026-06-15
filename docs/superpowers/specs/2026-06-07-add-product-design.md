# Add Product — Design Spec

**Date:** 2026-06-07
**Status:** Approved (pending user review)
**Feature:** Create a new product master via a dedicated full page at `/dashboard/products/add`.

---

## 1. Goal & Scope

Allow authorized users (OWNER, STOCK_MANAGER) to create a new **product master record** through
a dedicated full-page form, with data persisted to PostgreSQL via the existing
`features/products` layered architecture.

### In scope
- Full-page Add Product form at `/dashboard/products/add` (MUI).
- Server-side product creation with validation, SKU auto-generation, and RBAC.
- Reusable infrastructure: global Snackbar provider + `requireRole()` auth guard.
- DB migration adding a `status` enum column to `stock_movements` (schema-only prep for a
  future approval flow — no approval logic wired in this ticket).

### Out of scope (deferred to separate tickets)
- Initial stock entry / lot / movement creation (belongs to the **Receive stock** feature).
- Edit product flow (the `<ProductForm>` is written cleanly so edit can reuse it later).
- Category management / category CRUD (categories are read-only lookups here).
- Approval workflow logic (only the `status` column is added now).

---

## 2. Decisions (from grilling)

| # | Topic | Decision |
|---|-------|----------|
| 1 | Scope | Product master only (no lot/movement). Add `stock_movements.status` enum migration. |
| 2 | Category | Required `<Select>` populated from `categories` (already seeded). |
| 3 | SKU | Server-generated at submit (`FD####`, max+1). Optional field; user may override. Unique-violation → error. |
| 4 | Page / UI | Full page at `/dashboard/products/add`, MUI components. |
| 5 | Validation | Manual. Client validates for UX; **server (service) is source of truth**. |
| 6 | Feedback | New **global MUI Snackbar provider** (`useSnackbar()`); success → toast + redirect to list. |
| 7 | RBAC | 3 layers (action + page guard + UI) + reusable `requireRole()` helper. |
| 8 | Form | Create-only now, but extracted as a clean reusable `<ProductForm>`. Unit = free-text. |
| 9 | Migration default | enum default `pending`; `seed.ts` overrides historical movements to `approved`. |
| 10 | Errors | Field-level via MUI `error`/`helperText`; non-field errors via Alert/snackbar fallback. |
| 11 | Cancel | Confirm dialog **only when form is dirty**; otherwise navigate directly. |
| 12 | Categories source | `findAllCategories()` in `features/products/repository.ts`, loaded in RSC, passed as prop. |

> **Type style note (user instruction):** Do **not** use `readonly` in type declarations for this feature.

---

## 3. Architecture & File Map

Follows the existing layered pattern: `page (RSC) → action (use server) → service → repository`.

### New files
```
app/dashboard/products/add/page.tsx          # RSC: role guard, load categories, render form
components/products/product-form.tsx         # "use client" MUI form (create-only, reusable)
lib/auth-guard.ts                            # requireRole() + ForbiddenError
components/feedback/snackbar-provider.tsx    # global Snackbar context + useSnackbar()
```

### Modified files
```
app/db/stock-schema.ts          # + movementStatusEnum, + status column (default 'pending')
app/db/seed.ts                  # stockMovements inserts add status: "approved"
features/products/types.ts      # + CreateProductInput, + CategoryOption
features/products/repository.ts # + findAllCategories(), + generateNextSku(), + insertProduct()
features/products/service.ts    # + createProductService()
features/products/actions.ts    # + createProductAction() (requireRole guard)
constants/routes.ts             # + DASHBOARD.PRODUCTS_ADD: "/dashboard/products/add"
components/products/products-toolbar.tsx  # Add button → /add; hidden for STOCK_USER
app/dashboard/products/page.tsx # pass userRole to toolbar
app/providers.tsx               # wrap children in <SnackbarProvider>
drizzle/                        # generated migration via `pnpm db:generate`
```

---

## 4. Data Layer

### 4.1 Migration — `stock_movements.status`
`app/db/stock-schema.ts`:
```ts
export const movementStatusEnum = pgEnum("movement_status", [
  "pending",
  "approved",
  "unapproved",
]);

// inside stockMovements:
status: movementStatusEnum("status").notNull().default("pending"),
```
- `seed.ts`: every `stockMovements` insert sets `status: "approved"` explicitly.
- Generate SQL with `pnpm db:generate`; apply with `pnpm db:push`.

> ⚠️ **Backfill caveat:** `ALTER TABLE ADD COLUMN ... DEFAULT 'pending'` makes **existing rows**
> default to `pending`. To make historical movements `approved`, re-seed or run a one-time
> `UPDATE stock_movements SET status = 'approved';` after migration.

### 4.2 Repository functions
```ts
// {id, name}; name = categories.productname; ordered by name
findAllCategories(): Promise<CategoryOption[]>

// Find max numeric suffix among SKUs matching /^FD\d+$/, +1, zero-pad to >=4 digits.
// Empty table -> "FD0001". Beyond FD9999 -> expands to 5+ digits ("FD10000").
generateNextSku(): Promise<string>

// Insert product row, return the created ProductRecord.
insertProduct(input: InsertProductRow): Promise<ProductRecord>
```

---

## 5. Service Layer

```ts
createProductService(input: CreateProductInput): Promise<ActionResult<ProductRecord>>
```
Steps:
1. **Validate** (server source of truth):
   - `name`, `unit`, `categoryId` non-empty.
   - `minimumStock` integer ≥ 0.
   - `latestCost` (if provided) numeric ≥ 0.
   - On failure → `{ success: false, error }` (field-keyed; see §8).
2. **SKU resolution**: blank input → `generateNextSku()`; otherwise use the provided value.
3. **Insert** via `insertProduct`.
4. **Concurrency / uniqueness**:
   - Unique violation on `sku` → if SKU was auto-generated, retry generate+insert **once**;
     if it still collides, or the SKU was user-supplied, return
     `{ success: false, error: "SKU นี้มีอยู่แล้ว" }`.

Domain errors subclass `Error` (no thrown strings), per clean-code guidance.

---

## 6. Action Layer & RBAC

### 6.1 `lib/auth-guard.ts`
```ts
export class ForbiddenError extends Error {}

// Resolves session via auth.api.getSession({ headers: await headers() }).
// Throws ForbiddenError if no session or role not in `allowed`.
export async function requireRole(allowed: UserRole[]): Promise<Session>
```

### 6.2 `createProductAction`
```ts
"use server"
1. try { await requireRole(["OWNER", "STOCK_MANAGER"]); }
   catch { return { success: false, error: "คุณไม่มีสิทธิ์เพิ่มสินค้า" }; }
2. const result = await createProductService(input);
3. if (result.success) revalidatePath("/dashboard/products");
4. return result;   // no redirect here — client handles toast + navigation
```

### 6.3 RBAC layers
1. **Action** — `requireRole` before any write (real security boundary).
2. **Page guard** — `add/page.tsx` calls `requireRole` in a try/catch; on failure
   `redirect("/dashboard/products")`.
3. **UI** — `products-toolbar` receives `userRole`; the Add button is hidden for `STOCK_USER`.

---

## 7. UI Layer

### 7.1 Global Snackbar — `components/feedback/snackbar-provider.tsx`
- React context exposing `useSnackbar()` → `show(severity: "success" | "error", message: string)`.
- Renders MUI `<Snackbar><Alert/></Snackbar>`, auto-hide ~4s.
- Mounted in `app/providers.tsx` (above the router) so toasts survive navigation.

### 7.2 `<ProductForm>` (MUI, "use client")
Props: `categories: CategoryOption[]` (+ future-friendly shape for edit reuse).

Layout (mirrors `product-add.html`, minus the Initial-stock section):
- **Card "Basic information":** SKU (optional, hint "เว้นว่างเพื่อให้ระบบสร้างให้"),
  Name*, Category* (Select), Unit* (free-text), Reorder level (`minimumStock`),
  Size, Latest cost, Description (`note`).
- **Card "Status":** Active / Inactive radio (`isActive`, default Active).
- **Actions:** Cancel, Save product.

### 7.3 Submit flow (client)
```
local state (fields + fieldErrors) → client validate
  → createProductAction(input)
     success → useSnackbar().show("success", "สร้างสินค้าแล้ว") → router.push("/dashboard/products")
     error   → map to fieldErrors (and/or snackbar for non-field errors)
```

### 7.4 Cancel flow
- Track a `dirty` flag (true once any field changes).
- Cancel + dirty → MUI confirm Dialog ("ยืนยันยกเลิก? ข้อมูลที่กรอกจะหายไป");
  confirm → navigate to `/dashboard/products`.
- Cancel + not dirty → navigate directly.

---

## 8. Validation & Error Handling

- **Field-level errors:** `fieldErrors: Record<FieldName, string>` drives MUI `error` +
  `helperText` under each input.
- **Server → field mapping:** duplicate-SKU error maps to the `sku` field; validation errors
  carry their field key.
- **Non-field errors** (forbidden, network, unknown): shown via top-of-form `Alert` and/or
  error snackbar.
- Client validation mirrors server rules for fast feedback but is **not** authoritative.

---

## 9. Types (`features/products/types.ts`, no `readonly`)

```ts
export interface CategoryOption {
  id: string;
  name: string;
}

export interface CreateProductInput {
  sku: string;          // "" => auto-generate
  name: string;
  categoryId: string;
  unit: string;
  minimumStock: number;
  size: string | null;
  latestCost: string | null;  // numeric stored as string (Drizzle numeric)
  note: string | null;
  isActive: boolean;
}
```
Reuse existing `ProductRecord` and `ActionResult<T>`.

---

## 10. Build sequence (high level)

1. DB: add `movementStatusEnum` + `status` column; update `seed.ts`; `db:generate` + `db:push`.
2. Infra: `lib/auth-guard.ts`; `components/feedback/snackbar-provider.tsx`; wire `providers.tsx`.
3. Types: `CreateProductInput`, `CategoryOption`.
4. Repository: `findAllCategories`, `generateNextSku`, `insertProduct`.
5. Service: `createProductService`.
6. Action: `createProductAction`.
7. Routes: add `PRODUCTS_ADD`; update toolbar (link + role-based visibility); pass `userRole` from list page.
8. UI: `<ProductForm>` + `add/page.tsx` (guard + load categories).
9. Verify: `pnpm check` (Biome + tsc) and `pnpm build`.

---

## 11. Verification

- `pnpm check` passes (Biome + `tsc --noEmit`).
- `pnpm build` passes (touches routing + server code).
- Manual: create product (auto SKU + override), validation errors render per-field,
  duplicate SKU handled, RBAC blocks STOCK_USER (UI hidden, page redirects, action rejects),
  success toast + redirect, dirty-cancel confirm.
