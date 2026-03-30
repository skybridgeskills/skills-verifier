# Phase 2: Create providers.ts

## Scope of phase

Create `providers.ts` with all dependencies inlined. This file provides the provider chain composition and execution functionality.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

Create `src/lib/server/util/provider/providers.ts` with the following structure:

1. **Header comment** with:
   - Description of what the file provides
   - Blue Oak Model License 1.0.0 notice (public domain)
   - Link to https://blueoakcouncil.org/license/1.0.0

2. **Import from provider-ctx.ts**:
   - Import `runInContext` from `./provider-ctx.js`

3. **Inlined dependencies** (in order):
   - `panic` function (from panic.ts)
   - `MaybePromise` type (from maybe-promise.ts)
   - `Wrapper` type and `isWrapper` function (from wrapper.ts)
   - `extractDispose` function (from extract-dispose.ts)
   - `disposeOf` function (from dispose-of.ts)
   - `runWithProvider` function (from run-with-provider.ts)
   - `wrapWithProvider` function (from wrap-with-provider.ts)

4. **Main provider code** (from providers.ts):
   - Type definitions (`EmptyCtx`, `VoidOrEmpty`, `ProviderFn`, `ProviderLike`, etc.)
   - Type utilities (`InputOfProvider`, `OutputOfProvider`, `ProvidedValue`, `HasWrappers`, `ToEmpty`, `ToVoid`, `ToVoidOrEmpty`, `OutputOfChain`, `InputOfChain`, `ProviderChain`)
   - `ChainInput<T>()` function
   - `Providers()` function with all overloads (0-20 providers)
   - Implementation of `Providers()` function

The file should import only from `./provider-ctx.js` and have all other dependencies inlined.

### Code structure:

```typescript
/**
 * Provider Injection System
 *
 * This file provides a dependency injection system using provider functions.
 * Providers can be chained together to build up a context of services.
 *
 * Released into the public domain under Blue Oak Model License 1.0.0
 * https://blueoakcouncil.org/license/1.0.0
 */

import { runInContext } from './provider-ctx.js';

// Inline panic function
function panic(msgOrErr: string | Error): never { ... }

// Inline MaybePromise type
type MaybePromise<T> = T | Promise<T>;

// Inline Wrapper type and utilities
type Wrapper<TIn, TOut> = { ... }
function isWrapper(provider: ProviderLike<any, any>): provider is Wrapper<any, any> { ... }

// Inline extractDispose function
function extractDispose<T>(obj: T): { ... } { ... }

// Inline disposeOf function
async function disposeOf(provided: unknown): Promise<void> { ... }

// Inline runWithProvider function
async function runWithProvider<TProvider extends ProviderLike<any, any>, TResult>(...): Promise<TResult> { ... }

// Inline wrapWithProvider function
function wrapWithProvider<TProvider extends ProviderLike<any, any>, TResult>(...): ... { ... }

// Type definitions and utilities
export type EmptyCtx = Record<never, never>;
export type VoidOrEmpty = void | EmptyCtx;
export type ProviderFn<in TIn, out TOut> = (input: TIn) => MaybePromise<TOut>;
export type ProviderLike<TIn = any, TOut = any> = ProviderFn<TIn, TOut> | Wrapper<TIn, TOut>;
// ... all other type utilities ...

// Main Providers function
export function Providers(): ProviderFn<void, void>;
export function Providers<A extends ProviderLike>(a: A): ProviderChain<[A]>;
// ... all overloads (0-20 providers) ...
export function Providers(...providers: ProviderLike[]): any { ... }

// Export helper functions
export { runWithProvider, wrapWithProvider };
```

Note: The `runWithProvider` function will need to import `runWithExtraContext` from `provider-ctx.ts` as well.

## Validate

Run the following commands to validate:

```bash
turbo check test
```

The file should compile without errors and work together with `provider-ctx.ts`. Both files should type-check correctly.
