# CLAUDE.md

## Critical
- Next.js **16.2.7** with React **19** — APIs differ from training data. Read `node_modules/next/dist/docs/` before writing Next.js code. See @AGENTS.md.
- Use `pnpm` only. Never `npm` or `yarn`.
- Keep every doc file under 300–400 lines. Split when it grows past that.

## Stack
- Next.js App Router (`app/`) + React 19
- MUI v9 (`@mui/material`) + Emotion + Tailwind v4 (utility classes only)
- Better Auth (email/password) + Drizzle ORM + Postgres (Neon)
- Biome for lint/format, ESLint for Next rules, TypeScript strict

## Layout
- `app/` — routes, layouts, `theme.ts`, `providers.tsx`, `db/`
- `app/api/auth/[...all]/route.ts` — Better Auth handler
- `lib/` — `auth.ts` (server), `auth-client.ts` (client), helpers
- `components/` — shared React components
- `drizzle/` — generated SQL migrations (do not edit by hand)
- `middleware.ts` — gates `/dashboard/*`, `/login`, `/signup`

## Commands
- `pnpm dev` — dev server (webpack)
- `pnpm check` — Biome + `tsc --noEmit` (run before commit)
- `pnpm build` / `pnpm start` — prod build / serve
- `pnpm db:push` — sync Drizzle schema to DB
- `pnpm db:generate` — emit SQL into `drizzle/`
- `pnpm db:seed` — run `app/db/seed.ts`

## Rules
- Import via `@/*` alias (see [tsconfig.json](tsconfig.json)).
- Server-only auth: import `auth` from `@/lib/auth`. Client: import from `@/lib/auth-client`.
- DB access only through `@/app/db` (`db` export). Never call `postgres()` elsewhere.
- Schema lives in `app/db/*-schema.ts`. Re-export through `app/db/schema.ts` so Drizzle Kit sees it.
- MUI theme is the source of truth for colors/spacing — use `theme.palette.*` and `theme.palette.semantic.*`, not raw hex.
- Add MUI client components inside files marked `"use client"`. `app/layout.tsx` stays a server component; wrap children via `app/providers.tsx`.
- Protected routes live under `/dashboard/*`. Redirects are handled in [middleware.ts](middleware.ts) — extend its `matcher` when adding gated routes.
- `.env` is gitignored and contains live secrets. Never paste its values into docs, commits, or chat.

## Before commit
- Run `pnpm check`.
- Run `pnpm build` for changes touching routing, server code, or config.

## More
- Setup, daily workflow, schema details, auth flow: See @Context.md.
- Next.js-specific warning: See @AGENTS.md.
- Full README (TH/EN): See @README.md.
