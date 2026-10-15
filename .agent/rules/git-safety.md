# Git Safety Rules

These rules are non-negotiable and apply to all agents and automated tools working on `techeniac-lms-frontend`.

## Mandatory Approval for State-Changing Commands

- Every Git or GitHub CLI (`gh`) command that alters repository state (creating commits, modifying branches, switching branches, staging files, pushing, rebasing, stashing, tagging, etc.) requires explicit, per-command user approval.
- Present the exact command string to the user before proposing its execution.
- Read-only Git commands (`git status`, `git diff`, `git log`) do not alter state and may be run to verify working tree status.

## Prohibited Commands & Flags

- **`git add .` and `git add -A`**: Strictly prohibited. Files must be staged individually by exact file path (e.g. `git add app/layout.tsx`).
- **`git push --force` and `git push -f`**: Strictly prohibited. Force-pushing overrides history and can cause irreversible data loss.
- **`git reset --hard`**: Strictly prohibited. Hard resets destroy uncommitted or unstaged changes.
- **`--no-verify`**: Strictly prohibited. Git hooks and validation checks must never be bypassed.

## Branch Discipline

- All work must be conducted on feature, fix, or chore branches (`feat/*`, `fix/*`, `chore/*`) created from `dev`.
- Direct commits to protected branches (`main`, `staging`, and `dev`) are strictly prohibited and blocked by pre-commit hooks.
- All changes must arrive via Pull Requests with squash merging.
