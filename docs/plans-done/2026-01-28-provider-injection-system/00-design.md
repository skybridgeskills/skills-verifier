# Provider Injection System - Design

## Scope of Work

Bring in the provider injection system from the sbs monorepo as portable copy-and-paste files. The files will be self-contained with all dependencies inlined, making them easy to copy to other projects.

## File Structure

```
src/lib/server/util/provider/
├── providers.ts          # NEW: Combined providers system with all dependencies inlined
└── provider-ctx.ts       # NEW: Provider context management with all dependencies inlined
```

## Conceptual Architecture

The provider injection system consists of two main components:

**1. `providers.ts`** - Provider chain composition and execution

- Defines provider types (`ProviderFn`, `ProviderLike`, `Wrapper`)
- Provides `Providers()` function to chain multiple providers together
- Includes `runWithProvider()` and `wrapWithProvider()` for executing code with providers
- Handles resource disposal (dispose/asyncDispose) automatically
- All dependencies inlined: `extract-dispose`, `dispose-of`, `MaybePromise`, `Wrapper`, `panic`

**2. `provider-ctx.ts`** - Context storage and access

- Provides `providerCtx()` and `providerCtxSafe()` for accessing current context
- Manages async local storage for context propagation across async boundaries
- Includes `runInContext()` and `runWithExtraContext()` for context management
- All dependencies inlined: `UniversalAsyncLocalStore`, `FakeAsyncLocalStore`, `isPromiseLike`, `global-singleton`, `panic`

**Flow:**

```
User code → Providers() → runWithProvider() → runInContext() → providerCtx() → Access services
```

## Main Components and How They Interact

1. **Provider Functions**: Functions that take input context and return output context (services)
2. **Provider Chains**: Multiple providers composed together using `Providers()`
3. **Context Storage**: AsyncLocalStorage-based storage that propagates context through async calls
4. **Context Access**: Proxy-based access to current context via `providerCtx()`
5. **Resource Management**: Automatic disposal of resources using Symbol.dispose and Symbol.asyncDispose

Both files are self-contained and portable, with all dependencies inlined and Blue Oak Model License 1.0.0 headers.
