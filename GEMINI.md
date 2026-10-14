# Techeniac LMS Frontend

Techeniac LMS Frontend provides the student, instructor, and admin web experience for the Techeniac Learning Management System. Built with Next.js 16 (App Router), React 19, strict TypeScript, and Tailwind CSS, consuming the backend API at `/api/v1`.

## Repository Map

- `app/`: Next.js App Router root layouts, pages, and route groups (`(public)`, `(auth)`).
- `components/`: UI components organized by tier (`ui/`, `patterns/`, `layout/`, `app/`).
- `hooks/`: Reusable custom React hooks.
- `services/`: API client services communicating with `/api/v1`.
- `lib/`: Shared utility functions and third-party client instantiations.
- `context/`: Lightweight client-only React contexts.
- `proxy.ts`: Cheap edge routing/redirect placeholder (Next.js 16 convention; not security).
- `.agent/`: Engineering standards, architecture decisions, and non-negotiable rules.

## Available Commands

- `npm run dev`: Start Next.js local development server.
- `npm run build`: Create an optimized production build.
- `npm run start`: Start production Next.js server.
- `npm run lint`: Run ESLint checks.
- `npm run typecheck`: Run TypeScript static type analysis (`tsc --noEmit`).
- `npm test`: _(coming soon)_ Run automated unit and component tests.
- `npm run e2e`: _(coming soon)_ Run end-to-end integration tests.

## Non-Negotiable Rules

1. **No Secrets in Public Env**: Never store secrets, keys, or credentials in `NEXT_PUBLIC_*` or client code.
2. **OpenAPI-Generated Types**: Generate API schemas/types from backend OpenAPI specs; do not hand-write them.
3. **Server State in TanStack Query**: Keep server state in TanStack Query cache; never duplicate into local UI state.
4. **UI Hiding Is Not Access Control**: Frontend guards/proxy are UX affordances; backend enforces authorization.
5. **Ask Before Git/GitHub Actions**: Never run mutating Git commands without explicit per-command user approval.
6. **No Console Log**: Prohibit `console.log` in committed code; use structured logging/observability when configured.

## Agent Governance Links

- [Architecture Overview](.agent/architecture.md)
- [Development Conventions](.agent/conventions.md)
- [Architecture Decision Records](.agent/decisions.md)
- [Git Safety Rules](.agent/rules/git-safety.md)
- [Security Rules](.agent/rules/security.md)
