# Phase 6: Cleanup & validation (final)

## Scope of phase

Remove **temporary TODOs** introduced for scaffolding, **debug logging**, and **dead paths** that the plan explicitly replaced. Run full **lint, typecheck, and tests**. Write **`summary.md`** for this plan and **move** the plan directory to **`docs/plans-done/`** when implementation is complete. **Commit** with Conventional Commits (per plan command).

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a `TODO` comment so we can find it later — **this phase removes those that are done**.

## Implementation Details

**Cleanup**

- Grep the working tree for `TODO`, `FIXME`, `console.debug`, and temporary comments from phases 1–5; remove or convert to tracked issues if still valid.
- Confirm `.env.example` documents `SKIP_MEMORY_SEED` and any new vars.
- Align [`00-design.md`](./00-design.md) / [`00-notes.md`](./00-notes.md) only if the implementation diverged (brief delta note in `summary.md` is enough).

**Plan completion**

- Add [`summary.md`](./summary.md) in this folder with:
  - What shipped (startup context, seeding, create/list routes, UI direction).
  - Known follow-ups (e.g. Dynamo factory re-enable, job detail route).
- Move **`docs/plans/2026-04-06-skills-verifier-provider-storage/`** → **`docs/plans-done/2026-04-06-skills-verifier-provider-storage/`** (preserve directory name).

**Commit**

```
feat(server): … # or chore/docs as appropriate

- …
```

Use a bullet body when the diff is non-obvious.

## Validate

From the repository root:

```bash
pnpm exec prettier --check .
pnpm exec eslint .
pnpm exec svelte-kit sync && pnpm exec svelte-check --tsconfig ./tsconfig.json
pnpm exec vitest run
```

If the project relies on Storybook in CI, also:

```bash
pnpm run build:storybook
```

Fix all errors and warnings introduced or left unresolved by this plan before committing.
