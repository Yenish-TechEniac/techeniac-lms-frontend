# Architecture Decision Records (ADRs)

## ADR-001: Node.js 24 LTS Runtime

- **Date**: 2026-10-14
- **Status**: Accepted
- **Context**: The frontend application requires a stable Node.js runtime aligned with modern ECMAScript standards, performance optimizations, and long-term security maintenance, matching the backend runtime.
- **Options**:
  1. Node.js 20 LTS
  2. Node.js 22 LTS
  3. Node.js 24 LTS
- **Choice**: Node.js 24 LTS with `.nvmrc` set to `24` and `package.json` engines pinned to `>=24 <25`.
- **Reasons**: Node 24 is the active LTS release offering updated V8 engine optimizations, standard native cryptographic and fetch primitives, and parity with the `techeniac-lms-backend` environment.
- **Consequences**: Local development and deployment environments must use Node 24. Older Node runtime environments are unsupported.

---

## ADR-002: Next.js 16 App Router Framework

- **Date**: 2026-10-14
- **Status**: Accepted
- **Context**: The frontend requires a production React framework supporting server-side rendering, streaming, static optimization, edge routing, and native TypeScript support.
- **Options**:
  1. Vite + React Single Page App (SPA)
  2. Next.js 14 / 15 Pages Router
  3. Next.js 16 App Router with Turbopack
- **Choice**: Next.js 16.4.0 with App Router, Turbopack, and React 19.
- **Reasons**: Next.js 16 is the verified stable release installed by `create-next-app@latest`. App Router provides first-class React Server Components, streaming SSR, built-in metadata management, and nested layouts, while Turbopack dramatically accelerates local build and development cycles.
- **Consequences**: Route definitions must follow App Router folder conventions (`app/page.tsx`, `app/layout.tsx`). Client interactivity requires explicit `'use client'` directives.

---

## ADR-003: TypeScript Compiler Strictness Flags

- **Date**: 2026-10-14
- **Status**: Accepted
- **Context**: We need to configure TypeScript compilation options to guarantee maximum static type safety without breaking framework runtime execution or build pipelines.
- **Options**:
  1. Standard `strict: true` baseline only.
  2. `strict: true` with selective flags (`noUncheckedIndexedAccess`, `noImplicitOverride`) while disabling `exactOptionalPropertyTypes` based on hypothetical third-party typing conflicts.
  3. Fully enabled strict compiler flags: `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, and `exactOptionalPropertyTypes: true`.
- **Choice**: Option 3 (All four strict flags enabled).
- **Reasons**:
  - We ran empirical evaluations testing `npx tsc --noEmit` and `npm run build` on the scaffolded Next.js 16 App Router project with all four flags enabled.
  - The static analysis and Turbopack production build both exited with code 0 without any type or compilation errors.
  - Rather than disabling `exactOptionalPropertyTypes` based on assumptions, empirical evidence demonstrates full compatibility with the Next.js 16 and React 19 foundation.
  - `noUncheckedIndexedAccess: true` prevents invisible undefined runtime indexing errors.
  - `noImplicitOverride: true` enforces explicit intent when extending classes or methods.
  - `exactOptionalPropertyTypes: true` prevents accidentally assigning `undefined` to optional properties that expect omission or explicit values.
- **Consequences**: Developers must write precise types, handle potential `undefined` array lookups, and respect exact optional property assignments.

---

## ADR-004: Decoupled Repositories vs Monorepo

- **Date**: 2026-10-14
- **Status**: Accepted
- **Context**: The Techeniac LMS consists of an API backend (`techeniac-lms-backend`) and a user-facing frontend (`techeniac-lms-frontend`). We must select repository architecture.
- **Options**:
  1. Unified Monorepo housing both backend and frontend.
  2. Decoupled individual repositories (`techeniac-lms-backend` and `techeniac-lms-frontend`).
- **Choice**: Decoupled individual repositories.
- **Reasons**:
  - Autonomous deployment lifecycles and CI/CD pipelines (Vercel/edge for frontend, container/cloud for backend).
  - Clear domain boundaries: the backend exposes a versioned REST API (`/api/v1`), and the frontend acts as an API consumer.
  - Simpler dependency trees without monorepo tooling overhead (e.g. Turborepo, Nx).
  - Independent security access and repository permissions.
- **Consequences**: API contracts must be formally synchronized via OpenAPI specifications.

---

## ADR-005: Squash Merging for Feature Branches

- **Date**: 2026-10-14
- **Status**: Accepted
- **Context**: A Git branching and merging strategy is required to maintain a readable, bisectable history on the `main` branch.
- **Options**:
  1. Merge commits (`git merge --no-ff`)
  2. Fast-forward rebase
  3. Squash merge via Pull Requests
- **Choice**: Squash merging for all feature branches merged into `main`.
- **Reasons**:
  - Collapses noisy intermediate commits ("wip", "fix typo") into a single atomic commit on `main`.
  - Ensures every commit on `main` follows the Conventional Commits specification.
  - Simplifies rollbacks (`git revert`) and git bisect operations.
- **Consequences**: Individual commit histories on feature branches are discarded upon merge; the PR title and description become the squash commit message.

---

## ADR-006: Folder Layout & Component Tiering

- **Date**: 2026-10-14
- **Status**: Accepted
- **Context**: As the LMS application scales to include public landing pages, student portals, instructor course builders, and admin panels, clear folder conventions are necessary to prevent architectural decay.
- **Options**:
  1. Flat component structure inside `components/` and arbitrary route nesting.
  2. Feature-sliced route groups with a four-tier component architecture (`components/{ui,patterns,layout,app}`) and dedicated directories for `hooks/`, `services/`, `lib/`, and `context/`.
- **Choice**: Option 2.
- **Reasons**:
  - Route groups `app/(public)` and `app/(auth)` provide clear layout boundaries and route separation without altering URL pathnames.
  - Primitive UI atoms (`components/ui`) remain decoupled from business logic.
  - Complex UI assemblies (`components/patterns`) provide reusable compositions.
  - Page-specific views (`components/app`) keep route files lightweight.
  - Server state is isolated in TanStack Query via `services/`, preventing client context bloat.
- **Consequences**: Developers must place components and files within their appropriate tier based on reusability and scope.

---

## ADR-007: Migration to Proxy Convention (`proxy.ts`)

- **Date**: 2026-10-14
- **Status**: Accepted
- **Context**: In Next.js 16, the `middleware.ts` convention is officially deprecated in favor of `proxy.ts` (documented in `docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Turbopack outputs deprecation warnings during build when `middleware.ts` is present.
- **Options**:
  1. Retain deprecated `middleware.ts` and ignore build deprecation warnings.
  2. Migrate to the native Next.js 16 `proxy.ts` convention with `export function proxy()` and standard config matcher.
- **Choice**: Option 2 (`proxy.ts`).
- **Reasons**:
  - Next.js renamed the convention to prevent confusion with Express.js middleware and clarify that the feature acts as a network/edge boundary in front of the application.
  - Adopting `proxy.ts` eliminates deprecation warnings during `npm run build` and ensures long-term alignment with Next.js 16+ API conventions.
  - The routing logic (`NextResponse.next()`) and critical security disclaimer are preserved without behavioral regressions.
- **Consequences**: Root routing logic is maintained in `proxy.ts`. Developers must export `proxy` instead of `middleware`.
