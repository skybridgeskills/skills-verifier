# App Services and Context Setup

## Scope of Work

Set up basic app services (time-service and id-service) and create an app context system that provides these services along with the existing FrameworkClient. The services should follow a factory function pattern similar to the reference implementation in the osmt-monorepo, but without the provider context pattern (simpler, direct dependency injection).

### Services to Create

1. **Time Service** (`src/lib/server/services/time-service/`)
   - `time-service.ts` - Interface definition
   - `fake-time-service.ts` - Fake implementation with stable values for testing
   - `real-time-service.ts` - Real implementation using Date.now() and performance.now()
   - Methods:
     - `dateNowMs(): number` - Returns current instant as ms for models/business purposes (test impl returns stable values)
     - `performanceNowMs(): number` - Returns current time for performance calculations (all implementations return real time with maximum precision, not relative to any epoch)

2. **ID Service** (`src/lib/server/services/id-service/`)
   - `id-service.ts` - Interface definition
   - `fake-id-service.ts` - Fake implementation with predictable IDs for testing
   - `real-id-service.ts` - Real implementation using crypto for secure IDs
   - Methods:
     - `testStr(prefix: string): string` - Generates strings for testing with given prefix ("name" → "name-1", "name-2" in tests)
     - `secureUid(): string` - Generates base-62 ID with 128 bits of entropy for unguessable use cases (test impl uses testStr "secure1", etc.)
     - `uniqueUid(): string` - Generates base-62 ID with 64 bits of entropy for unique but not unguessable use cases (test impl uses testStr "unique1", etc.)

3. **App Context** (`src/lib/server/`)
   - `app-context.ts` - Interface definition for AppContext
   - `fake-app-context.ts` - Factory function that returns FakeAppContext with fake implementations
   - `real-app-context.ts` - Factory function that returns RealAppContext with real implementations

### Directory Structure

```
src/lib/server/
├── util/
│   ├── async-local-storage/
│   │   ├── universal-async-local-store.ts  # NEW: Universal async local storage
│   │   └── fake-async-local-store.ts       # NEW: Browser-compatible fake
│   ├── global-singleton.ts                 # NEW: Global singleton utilities
│   ├── panic.ts                             # NEW: Panic utility
│   └── is-promise-like.ts                  # NEW: Promise type guard
├── services/
│   ├── time-service/
│   │   ├── time-service.ts                 # NEW: Interface
│   │   ├── fake-time-service.ts            # NEW: Fake implementation for testing
│   │   ├── real-time-service.ts             # NEW: Real implementation
│   │   └── time-service.test.ts            # NEW: Unit tests
│   └── id-service/
│       ├── id-service.ts                    # NEW: Interface
│       ├── fake-id-service.ts               # NEW: Fake implementation for testing
│       ├── real-id-service.ts               # NEW: Real implementation
│       └── id-service.test.ts               # NEW: Unit tests
├── app-context.ts                          # NEW: AppContext interface + appContext(), runInContext(), runWithExtraContext()
├── fake-app-context.ts                     # NEW: FakeAppContext factory
└── real-app-context.ts                     # NEW: RealAppContext factory
```

## Current State of Codebase

### Existing Services

- **FrameworkClient** exists at `src/lib/server/clients/framework-client/`
  - Uses class-based pattern (`HttpFrameworkClient`, `FakeFrameworkClient`)
  - Has a factory function `createFrameworkService()` that reads from env vars
  - User wants a different pattern for new services (factory functions, not classes)

### Testing Infrastructure

- Vitest is configured for unit tests
- Test files use `.test.ts` extension
- No existing service pattern to follow (user wants to avoid the FrameworkClient pattern)

### Dependencies

- No base62 encoding utilities exist in the codebase
- No bigint conversion utilities exist
- Will need to implement these or find suitable libraries

## Questions

### 1. Base62 and BigInt Utilities

The ID service needs base62 encoding and bigint conversion utilities. Should we:

- **Option A**: Implement these utilities ourselves (copy from reference implementation)
- **Option B**: Find and install npm packages for these utilities
- **Option C**: Create minimal implementations inline in the id-service files

**Suggested answer**: Option A - Implement standalone utilities in a `src/lib/server/util/` directory. This keeps dependencies minimal and gives us full control. We can copy the logic from the reference implementation and adapt it to work without monorepo dependencies.

**Answer**: Copy from reference implementation. Create utilities in `src/lib/server/util/` directory.

### 2. Crypto Service Dependency

The ID service needs secure random bytes generation. Should we:

- **Option A**: Create a minimal crypto utility that wraps `crypto.getRandomValues()` directly
- **Option B**: Create a separate crypto-service similar to the reference implementation
- **Option C**: Use `crypto.getRandomValues()` directly in the real-id-service implementation

**Suggested answer**: Option C - Use `crypto.getRandomValues()` directly in the real-id-service. Keep it simple since we don't need the full crypto-service abstraction yet. If we need more crypto functionality later, we can extract it.

**Answer**: Option C - Use `crypto.getRandomValues()` directly in the real-id-service implementation.

### 3. Test Service Implementation Details

For `testStr()` in the test implementations:

- Should it maintain separate counters per prefix?
- Should it be deterministic across test runs (starting from 1 each time) or maintain state?

**Suggested answer**: Maintain separate counters per prefix, and reset counters for each test run (deterministic). This makes tests predictable and easier to debug.

**Answer**: Maintain separate counters per prefix, and reset counters for each test run (deterministic).

### 4. Performance.now() Precision

The `performanceNowMs()` method should return real time with maximum precision. Should we:

- **Option A**: Return `performance.now()` directly (which returns a high-precision timestamp relative to page load)
- **Option B**: Return `Date.now() + performance.now()` to get an absolute timestamp
- **Option C**: Document that it returns a relative timestamp and let callers handle it

**Suggested answer**: Option A - Return `performance.now()` directly. The method documentation should clarify that it returns a high-precision relative timestamp suitable for performance measurements, not an absolute timestamp.

**Answer**: Return `performance.now()` directly. Document that it returns a high-precision relative timestamp suitable for performance measurements.

### 5. App Context Usage Pattern

How should the app context be used in the application?

- **Option A**: Pass it explicitly as a parameter to functions that need it
- **Option B**: Use a context/provider pattern (like the reference implementation)
- **Option C**: Export factory functions and let each module create its own context

**Suggested answer**: Option A - Pass it explicitly. This is simpler and more explicit than a provider pattern. We can always add a provider pattern later if needed.

**Answer**: Use async local storage with provider context pattern. Copy from reference implementation (`/Users/yona/dev/skybridge/skybridgeskills-monorepo/sbs/packages/lib-util/src/util/provider/provider-ctx.ts`). Need to support in-browser as well, so we'll need a fake implementation. Keep it simple and contained.

**Implementation Notes**:

- Copy and adapt async local storage utilities from the reference implementation
- `app-context.ts` will contain:
  - `AppContext` interface definition
  - `appContext()` - function to get the current AppContext
  - `runInContext()` - run a function with a given AppContext
  - `runWithExtraContext()` - extend the current context with additional properties
- Put async local storage utilities in `src/lib/server/util/async-local-storage/`
- Need to copy/adapt: async-local-storage utilities, `global-singleton.ts`, `panic.ts`, `is-promise-like.ts`
- Keep implementations simple and self-contained (no monorepo dependencies)

### 6. Real App Context Factory

Should we create a `real-app-context.ts` factory function similar to `test-app-context.ts`?

**Suggested answer**: Yes, create `real-app-context.ts` that returns an AppContext with RealTimeService and RealIdService. This provides symmetry and makes it easy to use real services in production code.

**Answer**: Yes, create both `fake-app-context.ts` and `real-app-context.ts` factory functions.

### 7. FrameworkClient Integration

The AppContext includes FrameworkClient. Should we:

- **Option A**: Keep the existing `createFrameworkService()` factory and use it in the app context factories
- **Option B**: Refactor FrameworkClient to match the new factory pattern
- **Option C**: Create wrapper functions that adapt FrameworkClient to the app context

**Suggested answer**: Option A - Keep the existing factory function and use it in the app context factories. We can refactor FrameworkClient later if needed, but for now, integration is more important than consistency.

**Answer**: Keep FrameworkClient as-is for now, use `createFrameworkService()` in app context factories. Will migrate FrameworkClient to match the new pattern later.

### 8. Test File Naming

Should test files be:

- **Option A**: `test-time-service.ts` (as specified)
- **Option B**: `time-service.test.ts` (matching existing pattern)
- **Option C**: Both - implementation files named `test-*.ts` and unit test files named `*.test.ts`

**Suggested answer**: Option C - Implementation files use `test-*.ts` pattern (TestTimeService, TestIdService), and unit test files use `*.test.ts` pattern. This matches the user's specification while maintaining consistency with existing test files.

**Answer**: Use `fake-*.ts` for fake implementations (e.g., `fake-time-service.ts`, `fake-id-service.ts`) to avoid confusion with test files. Unit test files continue to use `*.test.ts` pattern.
