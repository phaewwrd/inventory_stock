# Receive Stock + Approvals — Design Spec

**Date:** 2026-06-14
**Status:** Approved (proceeding to implementation)
**Feature:** Submit a pending stock-receive transaction and approve/reject it, applying the
balance change only on approval.

---

## 1. Goal & Scope

A vertical slice covering the receive half of the stock-transaction workflow:

- **Receive** (`/dashboard/stock/receive`): any logged-in user submits a receive request →
  stored as a `pending` movement. Balance does **not** change yet.
- **Approvals** (`/dashboard/stock/approvals`): OWNER / STOCK_MANAGER approve (apply lot +
  balance) or reject (with a required reason) pending movements.

### In scope
- Schema migration extending `stock_movements` to carry the request + review audit.
- `features/stock` layer (types, repository, service, actions).
- Receive form (product picker, qty + balance preview, lot, optional expiry, cost, reference,
  source/reason, notes) + confirm dialog.
- Approvals page (pending count, DataTable, approve / reject-with-reason).
- Sidebar "Approvals" nav (OWNER / STOCK_MANAGER only).
- Products table "Receive" action passes `?productId=`.

### Out of scope (later tickets)
- Cut stock (reuses the same pending → approve infra; `reason` column is shared).
- Movement Log / History page.
- Weekly approval stats / avg approval time summary cards.
- Lot merging / cost averaging.

---

## 2. Decisions (from grilling)

| # | Topic | Decision |
|---|-------|----------|
| R1 | Apply model | Pending always — submit never moves balance. |
| R2 | Scope | Receive + Approvals together. |
| R3 | Pending representation | Store the request on the movement; materialize the lot only on approval. |
| R4 | RBAC | All roles submit; OWNER + STOCK_MANAGER approve/reject; self-approval allowed. |
| R5 | Fields | Add `reference_no` + generic `reason`. |
| R6 | Audit | Add `reviewed_by` + `reviewed_at`. |
| R7 | Product select | Prefill via `?productId=` + async Autocomplete search. |
| R8 | Page shape | Single form + confirm dialog (no decorative stepper). |
| R9 | After submit | Stay on the page, reset form, success toast. |
| R10 | Lot on approve | Always create a new lot (no merge). |
| R11 | Approvals UI | Pending count + generic DataTable + Approve / Reject(+reason) + inline review. |
| R12 | Expiry | Optional (schema is nullable; dry goods may not expire). |
| R13 | Reject reason | Required. |

> **Type style:** no `readonly` in declarations (per standing user instruction).
> **RBAC field:** use `session.user.authRole` (type `AuthRole`), never `session.user.role`.

---

## 3. Schema migration (`stock_movements`)

```ts
// new nullable columns
reqLotNo:      text("req_lot_no"),
reqExpiryDate: date("req_expiry_date"),
reqUnitCost:   numeric("req_unit_cost", { precision: 12, scale: 2 }),
referenceNo:   text("reference_no"),
reason:        text("reason"),
reviewedBy:    text("reviewed_by").references(() => user.id),
reviewedAt:    timestamp("reviewed_at"),

// changed: balanceAfter becomes nullable (null until approved)
balanceAfter:  integer("balance_after"),
```
Generate with `pnpm db:generate`, apply with `pnpm db:push`.

> Existing rows already have `balance_after` set; dropping NOT NULL leaves them intact.

---

## 4. Flow

### Submit (any logged-in role)
```
insert stock_movements {
  movementType: "receive", status: "pending",
  productId, quantity,
  reqLotNo, reqExpiryDate, reqUnitCost, referenceNo, reason, remark,
  createdBy, lotId: null, balanceAfter: null
}
→ success toast, reset form (balance unchanged)
```

### Approve (OWNER / STOCK_MANAGER) — single transaction
```
0. re-read movement; assert status === "pending" (guards double-approve)
1. insert product_lots {
     productId, lotNo: reqLotNo, expiryDate: reqExpiryDate,
     receivedDate: date(movement.createdAt),
     quantity, remainingQty: quantity, unitCost: reqUnitCost
   }
2. recompute balance = SUM(remainingQty) for product
3. update movement { status: "approved", lotId: newLot.id,
     balanceAfter: balance, reviewedBy, reviewedAt: now }
```

### Reject (OWNER / STOCK_MANAGER)
```
0. assert status === "pending"
1. update movement { status: "unapproved", reviewedBy, reviewedAt: now,
     reason: <required reject reason> }
   (no lot created → nothing to clean up)
```

---

## 5. File map

### New
```
app/dashboard/stock/receive/page.tsx       # RSC: require login, prefill product from ?productId
app/dashboard/stock/approvals/page.tsx     # RSC: requireRole([OWNER, STOCK_MANAGER]) + pending list
components/stock/receive-form.tsx          # "use client" form + Autocomplete + confirm Dialog
components/stock/approvals-table.tsx       # "use client" DataTable + approve/reject dialogs
features/stock/types.ts                    # ReceiveInput, PendingMovement, ProductPickerOption, results
features/stock/repository.ts               # search/insert/list/approve/reject queries
features/stock/service.ts                  # submitReceive / approve / reject services
features/stock/actions.ts                  # "use server" actions with RBAC guards
```

### Modified
```
app/db/stock-schema.ts                     # + 7 columns, balanceAfter nullable
constants/routes.ts                        # STOCK.APPROVALS
components/layout/sidebar.tsx              # + Approvals nav (OWNER/Manager)
components/products/products-table.tsx     # Receive action → ?productId=<id>
drizzle/                                   # generated migration
```

---

## 6. `features/stock` API

### types.ts (no readonly)
```ts
export interface ProductPickerOption {
  id: string; sku: string; name: string; unit: string; totalBalance: number;
}

export interface ReceiveInput {
  productId: string;
  quantity: number;
  lotNo: string;
  expiryDate: string | null;   // optional
  unitCost: string | null;     // numeric as string
  referenceNo: string | null;
  reason: string | null;       // "Source" in UI
  remark: string | null;
}

export interface PendingMovement {
  id: string;
  movementType: "receive" | "issue" | "adjustment";
  productSku: string;
  productName: string;
  quantity: number;
  reqLotNo: string | null;
  reqExpiryDate: string | null;
  reason: string | null;
  referenceNo: string | null;
  requestedByName: string | null;
  createdAt: string;           // ISO
}

export type StockActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string };
```

### repository.ts
```ts
searchProductsForPicker(q: string, limit: number): Promise<ProductPickerOption[]>
findProductBalance(productId: string): Promise<{ sku; name; unit; totalBalance } | null>
insertPendingReceive(input: ReceiveInput, userId: string): Promise<string>   // movement id
listPendingMovements(params): Promise<PaginatedResult<PendingMovement>>      // uses paginate()
getMovementForReview(id): Promise<MovementRow | null>
approveReceiveTx(movementId, reviewerId): Promise<"ok" | "not_pending" | "not_found">
rejectMovementTx(movementId, reviewerId, reason): Promise<"ok" | "not_pending" | "not_found">
```
Approve/reject run inside `db.transaction(...)`.

### service.ts
```ts
submitReceiveService(input, userId): Promise<StockActionResult<{ movementId: string }>>
getPendingApprovalsService(params): Promise<PaginatedResult<PendingMovement>>
approveMovementService(id, reviewerId): Promise<StockActionResult>
rejectMovementService(id, reviewerId, reason): Promise<StockActionResult>
```
Validation (server source of truth): `quantity` > 0 integer; `lotNo` required;
`unitCost`/`expiryDate` optional; reject `reason` required.

### actions.ts ("use server")
```ts
submitReceiveAction(input)        // requireRole(all three roles) — i.e. any session
approveMovementAction(id)         // requireRole([OWNER, STOCK_MANAGER])
rejectMovementAction(id, reason)  // requireRole([OWNER, STOCK_MANAGER])
```
Each catches `ForbiddenError` → `{ success:false, error }`; success → `revalidatePath`.

---

## 7. UI

### Receive form (`receive-form.tsx`)
- Product: MUI `Autocomplete` (async via `searchProductsForPicker`), prefilled from `?productId`.
  Shows current balance pill + "current → after" preview as quantity changes.
- Fields: Quantity* (number), Lot/Batch* (text), Expire date (date, optional),
  Unit cost (number, optional), Reference/PO (text), Source (`reason`, Select), Notes (`remark`).
- "Review & submit" → confirm `Dialog` summarizing the request → "Submit for approval"
  → `submitReceiveAction` → success toast (`useSnackbar`) + reset form.
- Field-level errors via MUI `error`/`helperText`.

### Approvals page (`approvals-table.tsx`)
- Header shows pending count.
- Generic `<DataTable>` columns: Product (sku+name), Type, Qty, Req lot, Expiry, Reason,
  Requested by, When, Actions.
- Actions per row: **Approve** (confirm dialog → `approveMovementAction`) and **Reject**
  (dialog with **required** reason field → `rejectMovementAction`).
- Server-side pagination via `<DataTablePagination>`.
- On success: toast + `router.refresh()`.

---

## 8. RBAC layers
1. **Actions** — `requireRole` (submit: any session; approve/reject: OWNER+MANAGER).
2. **Approvals page** — `requireRole([OWNER, STOCK_MANAGER])`, else redirect to dashboard.
3. **Sidebar** — Approvals nav rendered only for OWNER / STOCK_MANAGER.
4. Receive page — any authenticated session (middleware already gates `/dashboard/*`).

---

## 9. Verification
- `pnpm typecheck` clean.
- `pnpm build` passes (routing + server code).
- Manual: submit receive (balance unchanged) → approve (lot created, balance rises,
  movement approved) → reject another (status unapproved, no lot, reason recorded) →
  RBAC (STOCK_USER cannot see Approvals nav, page redirects, approve action rejects) →
  double-approve guarded.
