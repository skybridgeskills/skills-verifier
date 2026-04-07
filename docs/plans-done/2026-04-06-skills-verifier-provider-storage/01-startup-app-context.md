# Phase 1: Startup app context

## Scope of phase

Build **`AppContext` once** when the SvelteKit server starts, store it in a module-level reference, and reuse it for every HTTP request by wrapping `resolve` in `runInContext(existingCtx, …)`. Remove the current pattern of calling `DevAppContext()` inside `handle` on every request.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a `TODO` comment so we can find it later.

## Implementation Details

**Target files**

- [`src/hooks.server.ts`](../../../src/hooks.server.ts) — primary change.
- Optionally [`src/lib/server/dev-app-context.ts`](../../../src/lib/server/dev-app-context.ts) if you want a named export like `buildDevAppContext()` for clarity; not required if `DevAppContext()` stays the single entry.

**Steps**

1. Add SvelteKit [`init`](https://svelte.dev/docs/kit/hooks#Server-hooks-init) (or `ServerInit`) in `hooks.server.ts`:
   - `await DevAppContext()` and assign to a module-level variable, e.g. `let serverAppContext: AppContext`.
   - Handle failure: log and rethrow or `process.exit(1)` so misconfiguration fails fast at boot (match team preference; default: rethrow so the dev server shows the error).

2. Change `handle`:
   - Remove per-request `getAppContext()` that returns a new `DevAppContext()` result.
   - Use `return runInContext(serverAppContext, () => resolve(event))`.
   - Guard: if `serverAppContext` is unset (should not happen if `init` ran), throw a clear error.

3. **Typecheck / runtime:** Ensure `init` runs before `handle` in dev and preview; SvelteKit guarantees `init` before handling requests.

4. **Tests:** Any test that relied on “fresh context per request” now sees shared context — that is intended for dev server only. Unit tests use `TestAppContext` / `runInContext` directly and are unchanged by this phase.

**Example shape (illustrative)**

```typescript
import type { ServerInit } from '@sveltejs/kit';

let serverAppContext: AppContext;

export const init: ServerInit = async () => {
	serverAppContext = await DevAppContext();
};

export const handle: Handle = async ({ event, resolve }) => {
	return runInContext(serverAppContext, () => resolve(event));
};
```

## Validate

From the repository root:

```bash
pnpm exec svelte-kit sync && pnpm exec svelte-check --tsconfig ./tsconfig.json
pnpm exec vitest run
```

Manually: `pnpm dev`, load any route, confirm server starts and pages render (no duplicate-ID oddities from multiple DB instances).
