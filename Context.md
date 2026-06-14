# Context.md

Deeper reference for this repo. Load when the task touches the area. For everyday rules see @CLAUDE.md.

## Setup
- Install: `pnpm install`
- Copy env: `cp .env.example .env`, then fill `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `DATABASE_URL`.
- Generate `BETTER_AUTH_SECRET` with a CSPRNG (e.g. `openssl rand -base64 32`).
- Apply schema: `pnpm db:push` (uses `drizzle.config.ts` → `app/db/schema.ts`).
- Seed: `pnpm db:seed` (runs `app/db/seed.ts` via `tsx` + `dotenv -e .env`).
- Start: `pnpm dev` → http://localhost:3000.

## Database
- Driver: `postgres-js` via `drizzle-orm/postgres-js` ([app/db/index.ts](app/db/index.ts)).
- Single `db` instance — one `postgres()` client per process.
- Schemas live in:
  - [app/db/auth-schema.ts](app/db/auth-schema.ts) — Better Auth tables (`user`, `session`, `account`, `verification`).
  - [app/db/product-schema.ts](app/db/product-schema.ts) — `categories`, `products`, `product_lots`.
  - [app/db/stock-schema.ts](app/db/stock-schema.ts) — `stock_movements` + `movement_type` enum (`receive` / `issue` / `adjustment`).
- Aggregator: [app/db/schema.ts](app/db/schema.ts) re-exports all schemas — Drizzle Kit reads this single entry.
- Migrations: emit with `pnpm db:generate`, push with `pnpm db:push`. Do not edit files in `drizzle/` by hand.

### Conventions
- Primary keys are `text("id")` (string IDs — Better Auth uses CUID/UUID strings; match that for product tables).
- Money columns use `numeric(12, 2)`.
- Always add `created_at` / `updated_at` as `timestamp().defaultNow().notNull()` on mutable tables.
- Foreign keys reference parent `.id` and are `notNull()` unless genuinely optional (e.g. `stock_movements.lotId` for adjustments).
- When adding a new schema file, re-export it from [app/db/schema.ts](app/db/schema.ts).

## Auth (Better Auth)
- Server config: [lib/auth.ts](lib/auth.ts) — Drizzle adapter (`provider: "pg"`), email/password, `nextCookies()` plugin.
- Client: [lib/auth-client.ts](lib/auth-client.ts) — `createAuthClient` using `NEXT_PUBLIC_BETTER_AUTH_URL`.
- API handler: `app/api/auth/[...all]/route.ts` — do not add custom logic here; configure in `lib/auth.ts`.
- Session check on server: `auth.api.getSession({ headers })` (see [middleware.ts](middleware.ts)).
- Session check on client: `authClient.useSession()` (must be in a `"use client"` component).
- Add OAuth: configure `socialProviders` in `lib/auth.ts` and add the matching env vars; do not commit them.

### Route gating
- [middleware.ts](middleware.ts) `matcher: ["/dashboard/:path*", "/login", "/signup"]`, `runtime: "nodejs"`.
- Unauthenticated → `/dashboard/*` redirects to `/login?redirectTo=…`.
- Authenticated → `/login` or `/signup` redirects to `redirectTo` (or `/dashboard`).
- To gate a new path, add it to `matcher` and update the branching.

## UI / Theme
- Theme: [app/theme.ts](app/theme.ts) — light mode, `cssVariables: true`, MUI component overrides.
- Providers: [app/providers.tsx](app/providers.tsx) wraps with `ThemeProvider` + `CssBaseline`.
- Root layout: [app/layout.tsx](app/layout.tsx) — server component; loads Inter + JetBrains Mono via `next/font/google`, applies `AppRouterCacheProvider` for MUI SSR.

### Design tokens
- Brand: primary `#185FA5`, success `#639922`, warning `#BA7517`, error `#E24B4A`.
- Surfaces: `background.default #F6F7F9`, `paper #FFFFFF`, divider `#E5E8ED`.
- `palette.semantic` extends MUI with `primaryBg`, `successBg/Text`, `warningBg/Text`, `dangerBg/Text`, `surface2`, `border`, `borderStrong`, `textTertiary`.
- `palette.layout`: `sidebarWidth: 260`, `topbarHeight: 64`.
- Shape radius: 8. Cards override to 12 with `1px solid #E5E8ED` border.
- Buttons: `disableElevation`, `textTransform: none`, heights 32 / 38 / 44.

### Typography
- Family: `var(--font-inter)` fallback to system.
- Headings h1–h5 use weight 600 (h5 500); body weight 400; buttons 500.
- Mono font available as `var(--font-jetbrains-mono)`.

### Tailwind
- Tailwind v4 via `@tailwindcss/postcss` ([postcss.config.mjs](postcss.config.mjs)) and `app/globals.css`.
- Use Tailwind utilities for layout (flex / spacing). Use MUI for components and tokens. Do not duplicate color tokens in Tailwind config — pull from `theme.palette` when possible.

## Routing
- `app/page.tsx` — home (redirects to auth state).
- `app/login`, `app/signup`, `app/forgot-password` — auth pages.
- `app/dashboard` — protected area.
- Add new gated pages under `app/dashboard/<feature>/page.tsx` and rely on middleware for auth.
- Server components by default. Add `"use client"` only when using state, effects, MUI interactive components, or Better Auth client hooks.

## Tooling
- Biome: [biome.json](biome.json) — excludes `.next`, `node_modules`, `dist`, `build`. Run via `pnpm check` / `pnpm format`.
- ESLint: [eslint.config.mjs](eslint.config.mjs) — `eslint-config-next` core-web-vitals + TS, ignores `.next/`, `out/`, `build/`, `next-env.d.ts`.
- TypeScript: [tsconfig.json](tsconfig.json) — `strict: true`, `moduleResolution: bundler`, `@/*` → repo root.
- Next config: [next.config.ts](next.config.ts) — currently empty; keep changes minimal and document any added option here.

## Daily workflow
1. `git pull`
2. `pnpm install` if lockfile changed
3. `pnpm dev`
4. After schema edits: `pnpm db:push`
5. Need fresh data: `pnpm db:seed`

## Before opening a PR
- `pnpm check` (Biome + types)
- `pnpm build` (catch route/server regressions)
- Smoke-test with `pnpm start` on http://localhost:3000 if the change touches routing, middleware, or auth.

## Secrets
- `.env` is gitignored. Live `DATABASE_URL` and `BETTER_AUTH_SECRET` live there only.
- Rotate `BETTER_AUTH_SECRET` if it leaks; sessions sign with it.
- Never echo `.env` content into chat, commits, or other docs.

## Related docs
- @CLAUDE.md — short rules AI must follow every turn.
- @AGENTS.md — Next.js version warning.
- @README.md — full setup (TH/EN).
- @BETTER_AUTH_SETUP.md — Better Auth usage snippets and OAuth examples.
