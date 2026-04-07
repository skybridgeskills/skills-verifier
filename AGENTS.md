# Agent Guide

This document helps AI agents understand codebase conventions. **Full detail:** [`docs/style/`](docs/style/README.md) (kept aligned with the SkyBridge Skills monorepo).

## Before You Start

1. **Read the style guide** — Start with [`docs/style/README.md`](docs/style/README.md); open topic files (factories, providers, schemas, naming, file layout) when they apply.
2. **Look at existing examples** — Follow established patterns in similar files.
3. **Keep files small** — Extract helpers when files approach ~200 lines.

## Key Patterns

### 1. Factory Functions, Not Classes

```ts
// ✅ CORRECT
export function MyService(config: Config) {
  return {
    doSomething: () => { ... },
  };
}
export type MyService = ReturnType<typeof MyService>;

// ❌ WRONG — do not use classes
class MyService {
  constructor(private config: Config) {}
  doSomething() { ... }
}
```

### 2. ZodFactory for Schemas

```ts
// ✅ CORRECT
export const UserSpec = ZodFactory(
	z.object({
		id: z.string().uuid(),
		name: z.string()
	})
);
export type UserSpec = ReturnType<typeof UserSpec>;

// ❌ WRONG — don't define types separately from schemas
interface UserSpec {
	id: string;
	name: string;
}
```

### 3. Providers for Dependencies

```ts
// ✅ CORRECT
export function provideMyService({ database }: DatabaseCtx) {
	return { myService: MyService(database) };
}
export type MyServiceCtx = OutputOfProvider<typeof provideMyService>;

// ❌ WRONG — don't import singletons or use global state for injectable deps
import { database } from './singleton';
```

### 4. Organize by Domain

```
features/
  user/
    queries.ts      # ✅ Good — colocated
    ops.ts
    schemas.ts

// ❌ Wrong — organize only by technical type at the repo root
queries/
  user.ts
ops/
  user.ts
```

## Common Mistakes to Avoid

| Mistake                     | Why wrong                         | Correct pattern                                                                       |
| --------------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| Using classes               | `this` complexity, harder to test | Factory functions                                                                     |
| Separate type + schema      | Can drift out of sync             | `ZodFactory` gives both                                                               |
| `api/user.ts`-only layout   | Cross-cutting sprawl              | Domain folders under `src/lib/server/domain/` (and routes colocated in `src/routes/`) |
| 500-line files              | Hard to navigate                  | Extract helpers at ~200 lines                                                         |
| Importing singletons for DI | Hard to test                      | Provider context                                                                      |

## Where to Look for Examples

| Pattern              | Example                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Factory + ZodFactory | `src/lib/server/domain/job/job-resource.ts`, `src/lib/server/core/storage/app-resource.ts` |
| ZodFactory helper    | `src/lib/server/util/zod-factory.ts`                                                       |
| Providers            | `src/lib/server/util/provider/providers.ts`, `src/lib/server/util/provider/README.test.ts` |
| Architecture         | `docs/architecture.md`                                                                     |

## Testing and Validation

Use project scripts (e.g. `pnpm check`, `pnpm test`, `turbo check test` if configured) as documented in `package.json` and plan files.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <description>` (see [`.cursor/commands/commit.md`](.cursor/commands/commit.md)).

## Planning Work

When using the plan command, read **`docs/style/README.md` before design**, and copy applicable conventions into `00-design.md` and each phase file so they stay in scope during implementation (see [`.cursor/commands/plan.md`](.cursor/commands/plan.md)).

## Questions?

1. [`docs/style/`](docs/style/README.md) — Style guide
2. [`docs/architecture.md`](docs/architecture.md) — System overview
3. Similar existing code in this repo
