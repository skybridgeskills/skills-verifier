# Phase 1: SvelteKit adapter-node and container runtime

## Scope of phase

Make the app runnable as a **Node HTTP server** suitable for ECS: replace **`@sveltejs/adapter-auto`** with **`@sveltejs/adapter-node`**, configure build output, and confirm **`HOST` / `PORT`** behavior matches the task definition (typically **`HOST=0.0.0.0`**, **`PORT`** from env).

## Code Organization Reminders

- Prefer granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

1. Add **`@sveltejs/adapter-node`** (devDependency, aligned with Kit version).
2. Update **`svelte.config.js`**:
   - `import adapter from '@sveltejs/adapter-node'`
   - Optional: `adapter({ out: 'build' })` defaults are usually fine; document if overridden.
3. After **`pnpm build`**, verify **`build/`** contains **`index.js`** (or documented entry) per adapter-node docs.
4. Local smoke: **`node build`** with **`PORT=3000`** (and **`HOST=0.0.0.0`** if needed) and curl a page.
5. Update **[`docs/deployment.md`](../../deployment.md)** with production run instructions (env vars for Node adapter).

Reference: [SvelteKit adapter-node](https://svelte.dev/docs/kit/adapter-node).

## Tests

- Existing **`pnpm check`** / **`pnpm test`** must pass.
- No new unit tests required unless you add a tiny script; manual smoke suffices for this phase.

## Validate

```bash
pnpm install
pnpm build:svelte
node build
```

```bash
pnpm check
CONTEXT=test pnpm test:vitest
```
