# Development Conventions

## Branch Naming & Workflow

For feature and maintenance work (post-foundation setup), use semantic branch prefixes:

- `feat/<short-description>`: New client feature or page.
- `fix/<short-description>`: Bug fix in UI or client state.
- `chore/<short-description>`: Tooling, dependency updates, maintenance.
- `docs/<short-description>`: Documentation changes.
- `refactor/<short-description>`: Code restructuring without UI behavior changes.
- `test/<short-description>`: Adding or modifying automated tests.

_Note_: For TASK F0, work was explicitly authorized to occur directly on `main` to establish the foundational frontend baseline.

## Commit Standards

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- Format: `<type>(<optional scope>): <description>`
- Examples:
  - `feat(layout): add authenticated dashboard sidebar`
  - `fix(auth): handle expired refresh token redirect`
  - `chore(deps): update next to 16.4.0`

## Pull Request Discipline

- **Diff Size**: Pull requests should ideally remain under ~400 lines of changed code to facilitate thorough, high-quality peer review.
- **Merge Strategy**: Squash merging is mandatory for feature branches merged into `main`. This maintains a linear, clean history on `main` while giving developers freedom to create granular commits during development.
- **Main Branch Protection**: Direct commits to `main` are prohibited during standard team workflows. Changes must pass automated checks and code review before merging.

## TypeScript Standards

- Strict mode is fully enabled. Do not use `any` — use `unknown` with type narrowing or generic constraints.
- `noUncheckedIndexedAccess` is active: all indexed access (`array[i]` or `record[key]`) evaluates as `T | undefined`.
- `noImplicitOverride` is active: class method overrides must use the `override` keyword.
- `exactOptionalPropertyTypes` is active: optional properties cannot be passed explicit `undefined` unless specifically typed as `T | undefined`.

## Styling & Components

- **Tailwind CSS**: Use utility classes directly in JSX. Extract repeated UI patterns into `components/ui/` or `components/patterns/` rather than inventing ad-hoc CSS classes.
- **Component File Structure**: Use PascalCase for component filenames (`UserProfileCard.tsx`). Use standard camelCase for utility and hook files (`useAuth.ts`, `formatDate.ts`).
- **No `console.log`**: Avoid `console.log` in committed application code.
