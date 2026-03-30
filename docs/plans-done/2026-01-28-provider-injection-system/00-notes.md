# Provider Injection System - Notes

## Scope of Work

Bring in the provider injection system from the sbs monorepo (`/Users/yona/dev/skybridge/skybridgeskills-monorepo/sbs/packages/lib-util/src/util/provider/providers.ts`) into this project as portable copy-and-paste files.

The files should be placed in:

- `/Users/yona/dev/skybridge/skills-verifier/src/lib/server/util/provider`

Two files will be created:

1. **`providers.ts`** - Combines `providers.ts`, `run-with-provider.ts`, and `wrap-with-provider.ts` with all dependencies inlined
2. **`provider-ctx.ts`** - Combines `provider-ctx.ts` with all dependencies inlined

Key requirements:

- Inline all dependencies (no external imports except for existing utilities in the project)
- Inline `panic` function in each file (don't import from existing panic.ts)
- Add header comments explaining usage and licensing (Blue Oak Model License 1.0.0 - public domain)
- Files should be self-contained and portable for copying to other projects

## Current State

The target directory `/Users/yona/dev/skybridge/skills-verifier/src/lib/server/util/provider` does not exist yet.

The project already has some dependencies that can be reused:

- `src/lib/server/util/panic.ts` - panic utility (but will be inlined)
- `src/lib/server/util/async-local-storage/universal-async-local-store.ts` - async local storage
- `src/lib/server/util/global-singleton.ts` - global singleton utilities
- `src/lib/server/util/is-promise-like.ts` - promise-like type guard

## Dependencies to Inline

### For `providers.ts`:

- `extract-dispose` function (from `extract-dispose.ts`)
- `dispose-of` function (from `dispose-of.ts`)
- `MaybePromise` type (from `maybe-promise.ts`)
- `Wrapper` type and `isWrapper` function (from `wrapper.ts`)
- `runInContext` function (from `provider-ctx.ts`)
- `runWithProvider` function (from `run-with-provider.ts`)
- `wrapWithProvider` function (from `wrap-with-provider.ts`)
- `panic` function (inline)

### For `provider-ctx.ts`:

- `UniversalAsyncLocalStore` (inline - was previously in project but deleted)
- `FakeAsyncLocalStore` (inline - dependency of UniversalAsyncLocalStore)
- `isPromiseLike` function (inline - dependency of FakeAsyncLocalStore)
- `createGlobalSingleton` and `getGlobalSingleton` (inline - was previously in project but deleted)
- `panic` function (inline)

## Questions

### Q1: Should we import existing utilities or inline everything?

**Context**: The project already has `universal-async-local-store.ts`, `global-singleton.ts`, and `is-promise-like.ts` in the util directory. These are dependencies of `provider-ctx.ts`.

**Answer**: Inline everything. The user deleted the existing utilities in favor of embedded versions, so all dependencies should be inlined for maximum portability.

### Q2: Should `panic` be inlined in both files or imported?

**Context**: The user specifically mentioned "panic can just be inlined in each of those files", but the project already has a `panic.ts` file.

**Answer**: Yes, inline `panic` (and `panicLines` if needed) in both files to keep them completely self-contained and portable.

### Q3: What should the license header comment look like?

**Context**: The user wants Blue Oak Model License 1.0.0 (public domain) mentioned in the header.

**Answer**: Include a comment block at the top of each file that:

- Explains what the file provides
- States it's released into the public domain under Blue Oak Model License 1.0.0
- Includes a link to the license: https://blueoakcouncil.org/license/1.0.0

### Q4: Should we include type exports from wrapper.ts in providers.ts?

**Context**: `providers.ts` imports types from `wrapper.ts` (`Wrapper` type, `isWrapper` function). These need to be included in the combined file.

**Answer**: Yes, include the `Wrapper` type definition and `isWrapper` function in `providers.ts` since they're tightly coupled with the provider system.
