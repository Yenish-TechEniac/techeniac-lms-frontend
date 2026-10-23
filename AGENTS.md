<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Branch & Pull Request Rules

### Pre-Coding Branch Planning & Permission (Mandatory on Every Request)

Before modifying or creating any code for any feature, module, or change:

1. **Current Branch Verification**: Check the active Git branch (`git branch --show-current` or `git status`). Never modify code directly on protected branches (`main`, `staging`, `dev`).
2. **Determine Relevant Branch**:
   - Identify the appropriate branch for the task adhering to naming conventions: `feat/<name>`, `fix/<name>`, or `chore/<name>` (branched from `dev`).
   - If a suitable branch already exists, confirm whether to continue on it.
3. **Multi-Branch Roadmap for Large Features**:
   - For large features or modules (especially those likely to exceed the ~400-line diff limit), plan and present a complete multi-branch roadmap upfront (e.g., `feat/<module>-schema-types`, `feat/<module>-ui`, `feat/<module>-page`).
   - Obtain user approval on the branching plan before starting work.
4. **Explicit User Approval for Branch Creation & Switching**:
   - State clearly which branch is required and if a new branch must be created.
   - Present the exact Git command (e.g., `git checkout -b feat/... dev`) and obtain user permission before creating or switching branches.
5. **Ensure Workspace Is on Target Branch Before Making Changes**:
   - Ensure the repository is switched to the approved branch _before_ making any file edits or generating code.

### 400-Line Code Change Limit

- **Diff Limit**: Changes in a single branch or Pull Request must not exceed ~400 lines of code.
- **Mandatory User Confirmation**: If a task or feature requires changing or adding more than 400 lines of code in a single branch, the agent must ask the user for explicit permission before proceeding with the changes, or recommend breaking the work down into multiple smaller branches/PRs.

## Governance Links

- [GEMINI.md](GEMINI.md)
- [Git Safety Rules](.agent/rules/git-safety.md)
- [Security Rules](.agent/rules/security.md)
- [UI Components & Design System Rules](.agent/rules/ui-components.md)
- [Architecture Overview](.agent/architecture.md)
- [Development Conventions](.agent/conventions.md)
- [Architecture Decision Records](.agent/decisions.md)
