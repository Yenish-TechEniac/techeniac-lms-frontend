# techeniac-lms-frontend

## Prerequisites

- Node.js 24 LTS (see `.nvmrc`)
- npm (bundled with Node 24)

## Setup

```bash
# Ensure Node 24 is active
nvm use

# Install dependencies
npm install
```

## Environment

```bash
# Copy example environment configuration
cp .env.example .env.local
```

> **Note**: `NEXT_PUBLIC_*` variables are bundled into client-side code and publicly visible. Never place secrets in `.env.local`.

## Run

```bash
# Start local development server
npm run dev

# Run static type analysis
npm run typecheck

# Lint source files
npm run lint

# Create production build
npm run build

# Start production server
npm run start
```

## Test

_(Automated test suite coming soon)_

## Migrations

Frontend does not manage database migrations. Database schema migrations are handled by `techeniac-lms-backend`.

## Troubleshooting

- **Node Version Mismatch**: Ensure Node 24 is active by running `nvm use` or verify with `node -v`.
- **API Connection**: Ensure `NEXT_PUBLIC_API_BASE_URL` in `.env.local` points to a running backend service (default: `http://localhost:4000/api/v1`).

## Docs

- [Architecture Overview](.agent/architecture.md)
- [Development Conventions](.agent/conventions.md)
- [Architecture Decision Records](.agent/decisions.md)
- [Git Safety Rules](.agent/rules/git-safety.md)
- [Security Rules](.agent/rules/security.md)
