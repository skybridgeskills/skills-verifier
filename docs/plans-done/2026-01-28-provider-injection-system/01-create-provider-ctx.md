# Phase 1: Create provider-ctx.ts

## Scope of phase

Create `provider-ctx.ts` with all dependencies inlined. This file provides context storage and access functionality for the provider system.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

Create `src/lib/server/util/provider/provider-ctx.ts` with the following structure:

1. **Header comment** with:
   - Description of what the file provides
   - Blue Oak Model License 1.0.0 notice (public domain)
   - Link to https://blueoakcouncil.org/license/1.0.0

2. **Inlined dependencies** (in order):
   - `panic` function (from panic.ts)
   - `isPromiseLike` function (from is-promise-like.ts)
   - `FakeAsyncLocalStore` function (from fake-async-local-store.ts)
   - `UniversalAsyncLocalStore` function (from universal-async-local-store.ts)
   - `getGlobalObject` helper function (from global-singleton.ts)
   - `createGlobalSingleton` function (from global-singleton.ts)
   - `getGlobalSingleton` function (from global-singleton.ts)

3. **Main provider context code** (from provider-ctx.ts):
   - `providerCtx<T>()` function
   - `providerCtxSafe<T>()` function
   - `runInContext<T>(context, fn)` function
   - `runWithExtraContext<T>(extra, fn)` function
   - `runOutsideProviderCtx<T>(fn)` function
   - `contextStore` export
   - `strictContextProxy` and `safeContextProxy` implementations
   - `getContextStoreSync()` helper function

The file should be self-contained with no external imports except for Node.js built-ins (`async_hooks`).

### Code structure:

```typescript
/**
 * Provider Context Management
 *
 * This file provides context storage and access for the provider injection system.
 * It uses AsyncLocalStorage to propagate context through async boundaries.
 *
 * Released into the public domain under Blue Oak Model License 1.0.0
 * https://blueoakcouncil.org/license/1.0.0
 */

// Inline panic function
function panic(msgOrErr: string | Error): never { ... }

// Inline isPromiseLike function
function isPromiseLike<T>(value: any): value is PromiseLike<T> { ... }

// Inline FakeAsyncLocalStore function
function FakeAsyncLocalStore<T>(): ... { ... }

// Inline UniversalAsyncLocalStore function
async function UniversalAsyncLocalStore<T>(): Promise<...> { ... }

// Inline global singleton utilities
function getGlobalObject(): typeof globalThis { ... }
async function createGlobalSingleton<T>(...): Promise<T> { ... }
function getGlobalSingleton<T>(key: string): T { ... }

// Main provider context code
export function providerCtx<T>() { ... }
export function providerCtxSafe<T>() { ... }
export function runInContext<T>(context: object, fn: () => T): T { ... }
export function runWithExtraContext<T>(extra: object, fn: () => T): T { ... }
export function runOutsideProviderCtx<T>(fn: () => T): T { ... }
export const contextStore = await createGlobalSingleton(...);
```

## Validate

Run the following commands to validate:

```bash
turbo check test
```

The file should compile without errors. Since this is a new file, there may not be tests yet, but it should at least compile and type-check correctly.
