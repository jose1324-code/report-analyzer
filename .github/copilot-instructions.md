# Copilot Instructions for Carenova Health Application

## Architecture Overview
This workspace contains two interconnected modules for a health application (Carenova):
- **Landing Module** (`langing-_module-main/`): Vite-based React SPA with Express server for marketing/landing pages. Focuses on client-side routing and minimal server-side logic.
- **Dashboard Module** (`dashborad_module-main/`): Next.js 16 full-stack app with App Router for user dashboard. Includes health features like chatbot, doctor access, drug pricing, and risk prediction. Uses Prisma ORM for database interactions and mini-services for backend logic.

Key structural decisions: Modular separation allows independent development/deployment. Dashboard prioritizes SSR for SEO and performance; landing uses SPA for fast initial loads.

## Data Flows & Integration
- Dashboard API routes (`src/app/api/`) handle data fetching and mutations, interfacing with Prisma schema (`prisma/schema.prisma`) for type-safe DB operations.
- Landing server routes (`server/routes/`) prefixed with `/api/` for demos or encapsulated logic (e.g., private keys, DB ops).
- Shared types in landing (`shared/api.ts`) ensure type safety across client/server.
- Caddyfile (`Caddyfile`) configures reverse proxy for production deployment.
- WebSocket example (`examples/websocket/`) demonstrates real-time communication patterns.

## Critical Workflows
- **Dashboard Development**: Use `bun install` (not npm/pnpm), `bun run dev` for hot-reload at http://localhost:3000. Build with `bun run build`.
- **Landing Development**: Use `pnpm dev` for integrated client/server at port 8080. Test with `pnpm test` (Vitest). Build with `pnpm build`.
- **Database**: Run Prisma migrations via `npx prisma migrate dev` in dashboard module. Schema defines health-related models (users, drugs, etc.).
- **Deployment**: Dashboard uses Next.js production server; landing supports Netlify/Vercel or binary executables.

## Project-Specific Conventions
- **Package Managers**: Dashboard exclusively uses Bun; landing uses PNPM. Avoid mixing.
- **UI Components**: Both use Tailwind CSS + shadcn/ui (dashboard) or Radix UI (landing). Utility function `cn()` in `lib/utils.ts` for conditional classes (e.g., `className={cn("base", { "active": isActive })}`).
- **Routing**: Dashboard uses Next.js App Router (`src/app/`); landing uses React Router 6 in `client/App.tsx` with pages in `client/pages/`.
- **Path Aliases**: Landing uses `@shared/*` for shared folder, `@/*` for client. Dashboard follows Next.js defaults.
- **Forms & Validation**: Use React Hook Form + Zod for type-safe forms (e.g., in dashboard components).
- **State Management**: Dashboard uses Zustand + TanStack Query; landing relies on React state/hooks.
- **Authentication**: Dashboard integrates NextAuth.js for auth flows.
- **Internationalization**: Dashboard ready with Next Intl; configure in `src/app/` for multi-language support.

## Examples & Patterns
- **Adding Dashboard Feature**: Create page in `src/app/feature/page.tsx`, API in `src/app/api/feature/route.ts`, component in `src/components/dashboard/`. Use Prisma client from `lib/db.ts`.
- **Adding Landing API**: Define interface in `shared/api.ts`, handler in `server/routes/feature.ts`, register in `server/index.ts` as `app.get("/api/feature", handler)`.
- **UI Component**: Extend shadcn/ui in `src/components/ui/` (dashboard) or `client/components/ui/` (landing). Example: Import `Button` from `@/components/ui/button` and customize variants.
- **Testing**: Landing uses Vitest; dashboard follows Next.js testing patterns (not specified, use standard Jest/RTL if needed).

Focus on health domain: Features like symptom checker, drug pricing involve medical data handling with privacy/security in mind.</content>
<parameter name="filePath">c:\Users\jeeva\programming languages\jr project\joseline\.github\copilot-instructions.md