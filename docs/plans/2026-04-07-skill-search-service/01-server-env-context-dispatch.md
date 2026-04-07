# Phase 1: Server env + context dispatch

## Scope of phase

Create the environment parsing and context dispatch infrastructure:

- `app-env.ts` — Parse base `CONTEXT` from passed env object using Zod discriminated union
- `build-app-context.ts` — Dispatcher that switches on `CONTEXT` and delegates to appropriate context builder
- Update `hooks.server.ts` — Use `$env/dynamic/private`, call `buildAppContext(env)`
- Remove global `process.env` access in favor of passed env parameter

## Code Organization Reminders

- Prefer granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Style conventions

- **Zod discriminated union** for `CONTEXT` parsing with `AwsAppEnv`, `DevAppEnv`, `TestAppEnv`.
- **Factory functions** — no classes for service logic.
- **Env as parameter** — pass `env: Record<string, string>` through chain instead of `process.env`.
- **Files ~200 lines** — split if approaching limit.

## Implementation Details

### 1.1 Create `src/lib/server/app-env.ts`

```typescript
import { ZodFactory } from '$lib/server/util/zod-factory.js';
import z from 'zod';

// Base context enum
export const ContextSpec = ZodFactory(z.enum(['aws', 'dev', 'test']));
export type ContextSpec = ReturnType<typeof ContextSpec>;

// Base env schema - only parses CONTEXT, used for dispatch
export const BaseAppEnv = ZodFactory(
	z.object({
		CONTEXT: ContextSpec.schema.default('dev')
	})
);
export type BaseAppEnv = ReturnType<typeof BaseAppEnv>;

// AWS context - requires CE vars
export const AwsAppEnv = ZodFactory(
	z.object({
		CONTEXT: z.literal('aws'),
		CREDENTIAL_ENGINE_SEARCH_URL: z.string().min(1),
		CREDENTIAL_ENGINE_API_KEY: z.string().min(1)
		// Add other AWS-specific env vars here as needed
	})
);
export type AwsAppEnv = ReturnType<typeof AwsAppEnv>;

// Dev context - optional CE vars
export const DevAppEnv = ZodFactory(
	z.object({
		CONTEXT: z.literal('dev'),
		CREDENTIAL_ENGINE_SEARCH_URL: z.string().optional(),
		CREDENTIAL_ENGINE_API_KEY: z.string().optional()
		// Add other dev-specific env vars here
	})
);
export type DevAppEnv = ReturnType<typeof DevAppEnv>;

// Test context - minimal env
export const TestAppEnv = ZodFactory(
	z.object({
		CONTEXT: z.literal('test')
	})
);
export type TestAppEnv = ReturnType<typeof TestAppEnv>;

/**
 * Parse base env to get CONTEXT for dispatch.
 * Defaults to 'dev' if CONTEXT not set.
 */
export function parseBaseEnv(env: Record<string, unknown>): BaseAppEnv {
	return BaseAppEnv({
		CONTEXT: env.CONTEXT ?? 'dev'
	});
}
```

### 1.2 Create `src/lib/server/build-app-context.ts`

```typescript
import type { AppContext } from './app-context.js';
import { parseBaseEnv } from './app-env.js';

// Forward declarations - will be implemented in later phases
declare function AwsAppContext(env: Record<string, unknown>): Promise<AppContext>;
declare function DevAppContext(env: Record<string, unknown>): Promise<AppContext>;
declare function TestAppContext(env: Record<string, unknown>): Promise<AppContext>;

/**
 * Build AppContext based on CONTEXT env var.
 * Dispatches to appropriate context builder based on parsed base env.
 */
export async function buildAppContext(env: Record<string, unknown>): Promise<AppContext> {
	const baseEnv = parseBaseEnv(env);

	switch (baseEnv.CONTEXT) {
		case 'aws':
			// Will be implemented in Phase 3
			throw new Error('AwsAppContext not yet implemented');
		case 'dev':
			// Currently using existing DevAppContext - will be updated in Phase 2
			// For now, maintain backward compatibility
			const { DevAppContext } = await import('./dev-app-context.js');
			return DevAppContext(env);
		case 'test':
			// Will be updated in Phase 4
			const { TestAppContext } = await import('./test-app-context.js');
			return TestAppContext(env);
		default:
			// Exhaustive check
			const _exhaustive: never = baseEnv.CONTEXT;
			throw new Error(`Unknown context: ${_exhaustive}`);
	}
}
```

### 1.3 Update `src/hooks.server.ts`

Before:

```typescript
import type { AppContext } from '$lib/server/app-context.js';
import { seedDevDataIfNeeded } from '$lib/server/core/storage/seed-dev-data.js';
import { DevAppContext } from '$lib/server/dev-app-context.js';
import { panic } from '$lib/server/util/panic.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';

let serverAppContext: AppContext | undefined;

export const init: ServerInit = async () => {
	serverAppContext = await DevAppContext();
	await runInContext(serverAppContext, async () => {
		await seedDevDataIfNeeded(serverAppContext!);
	});
};
```

After:

```typescript
import type { AppContext } from '$lib/server/app-context.js';
import { buildAppContext } from '$lib/server/build-app-context.js';
import { seedDevDataIfNeeded } from '$lib/server/core/storage/seed-dev-data.js';
import { panic } from '$lib/server/util/panic.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';
import { env } from '$env/dynamic/private';

let serverAppContext: AppContext | undefined;

export const init: ServerInit = async () => {
	// Pass SvelteKit server env to build context based on CONTEXT
	serverAppContext = await buildAppContext(env);
	await runInContext(serverAppContext, async () => {
		await seedDevDataIfNeeded(serverAppContext!);
	});
};
```

### 1.4 Update `src/lib/server/dev-app-context.ts` to accept env parameter

Update signature from `function DevAppContext(): Promise<AppContext>` to `function DevAppContext(env?: Record<string, unknown>): Promise<AppContext>`. For now, ignore the env parameter to maintain backward compatibility during this phase. Full env parsing will come in Phase 2.

### 1.5 Update `src/lib/server/test-app-context.ts` similarly

Update signature to accept env parameter. Will be fully utilized in Phase 4.

## Tests

Add `app-env.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { parseBaseEnv, BaseAppEnv, ContextSpec } from './app-env.js';

describe('parseBaseEnv', () => {
	it('defaults to dev when CONTEXT not set', () => {
		const result = parseBaseEnv({});
		expect(result.CONTEXT).toBe('dev');
	});

	it('parses explicit dev context', () => {
		const result = parseBaseEnv({ CONTEXT: 'dev' });
		expect(result.CONTEXT).toBe('dev');
	});

	it('parses aws context', () => {
		const result = parseBaseEnv({ CONTEXT: 'aws' });
		expect(result.CONTEXT).toBe('aws');
	});

	it('parses test context', () => {
		const result = parseBaseEnv({ CONTEXT: 'test' });
		expect(result.CONTEXT).toBe('test');
	});
});

describe('ContextSpec', () => {
	it('accepts valid contexts', () => {
		expect(ContextSpec('aws')).toBe('aws');
		expect(ContextSpec('dev')).toBe('dev');
		expect(ContextSpec('test')).toBe('test');
	});

	it('rejects invalid contexts', () => {
		expect(() => ContextSpec('invalid')).toThrow();
	});
});
```

## Validate

Run validation commands:

```bash
pnpm check
pnpm test:vitest
```

Ensure:

- TypeScript compiles without errors
- `hooks.server.ts` changes work in dev server
- Tests for `app-env.ts` pass
- No regression in existing functionality (dev server starts correctly)

## Migration notes

- Existing `.env` files without `CONTEXT` will default to `dev` behavior
- No breaking changes to current dev workflow
- AWS context will throw with clear error until Phase 3 implements it
