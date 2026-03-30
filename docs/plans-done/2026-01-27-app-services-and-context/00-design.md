# Design: App Services and Context Setup

## Scope of Work

Set up basic app services (time-service and id-service) and create an app context system that provides these services along with the existing FrameworkClient. The services follow a factory function pattern similar to the reference implementation, using async local storage for context management.

## File Structure

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
│   │   ├── time-service.ts                 # NEW: Interface definition
│   │   ├── fake-time-service.ts            # NEW: Fake implementation for testing
│   │   ├── real-time-service.ts            # NEW: Real implementation
│   │   └── time-service.test.ts            # NEW: Unit tests
│   └── id-service/
│       ├── id-service.ts                    # NEW: Interface definition
│       ├── fake-id-service.ts               # NEW: Fake implementation for testing
│       ├── real-id-service.ts               # NEW: Real implementation
│       └── id-service.test.ts               # NEW: Unit tests
├── app-context.ts                          # NEW: AppContext interface + appContext(), runInContext(), runWithExtraContext()
├── fake-app-context.ts                     # NEW: FakeAppContext factory
└── real-app-context.ts                     # NEW: RealAppContext factory
```

## Conceptual Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    App Context                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ TimeService  │  │  IdService   │  │FrameworkClient│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                 │          │
│    ┌────┴────┐        ┌────┴────┐            │          │
│    │ Fake    │        │  Fake   │            │          │
│    │ Real    │        │  Real   │            │          │
│    └─────────┘        └─────────┘            │          │
│                                              │          │
│         Async Local Storage                  │          │
│         - Node: AsyncLocalStorage           │          │
│         - Browser: FakeAsyncLocalStore      │          │
│                                              │          │
│  appContext() → get current context         │          │
│  runInContext() → run with context          │          │
│  runWithExtraContext() → extend context      │          │
└─────────────────────────────────────────────────────────┘
```

## Main Components

### 1. Async Local Storage System

Provides context storage that works in both Node.js and browser environments:

- **UniversalAsyncLocalStore**: Detects environment and returns appropriate implementation
- **FakeAsyncLocalStore**: Browser-compatible implementation using module-level state
- Uses global singleton pattern to ensure shared instance across bundled/unbundled code

### 2. Time Service

Provides time-related functionality with testable implementations:

**Interface** (`TimeService`):

- `dateNowMs(): number` - Returns current instant as milliseconds for models/business purposes
  - Fake implementation returns stable values (useful for deterministic tests)
  - Real implementation returns `Date.now()`
- `performanceNowMs(): number` - Returns high-precision time for performance calculations
  - All implementations return real `performance.now()` (relative timestamp, not absolute)
  - Documented as suitable for performance measurements only

**Implementations**:

- `FakeTimeService()` - Factory function returning fake implementation
- `RealTimeService()` - Factory function returning real implementation

### 3. ID Service

Provides ID generation with different security levels:

**Interface** (`IdService`):

- `testStr(prefix: string): string` - Generates test strings with incrementing counters per prefix
  - Fake implementation: "name" → "name-1", "name-2", etc. (deterministic, resets per test)
  - Real implementation: Uses time-based strings (not commonly used in production)
- `secureUid(): string` - Generates base-62 ID with 128 bits of entropy (unguessable)
  - Fake implementation: Uses `testStr("secure1")`, `testStr("secure2")`, etc.
  - Real implementation: Uses crypto.getRandomValues() + base62 encoding
- `uniqueUid(): string` - Generates base-62 ID with 64 bits of entropy (unique but guessable)
  - Fake implementation: Uses `testStr("unique1")`, `testStr("unique2")`, etc.
  - Real implementation: Uses crypto.getRandomValues() + base62 encoding

**Implementations**:

- `FakeIdService()` - Factory function returning fake implementation
- `RealIdService()` - Factory function returning real implementation

**Utilities Needed**:

- Base62 encoding utilities (copy from reference implementation)
- BigInt conversion utilities (copy from reference implementation)
- Located in `src/lib/server/util/` (to be created as needed)

### 4. App Context

Container for all application services, accessed via async local storage:

**Interface** (`AppContext`):

```typescript
interface AppContext {
	timeService: TimeService;
	idService: IdService;
	frameworkClient: FrameworkClient;
}
```

**Access Functions** (in `app-context.ts`):

- `appContext(): AppContext` - Get the current AppContext from async local storage (throws if not set)
- `runInContext(context: AppContext, fn: () => T): T` - Run a function with the given context
- `runWithExtraContext(extra: Partial<AppContext>, fn: () => T): T` - Extend current context with additional properties

**Factory Functions**:

- `FakeAppContext()` - Returns AppContext with FakeTimeService, FakeIdService, and FrameworkClient (via createFrameworkService())
- `RealAppContext()` - Returns AppContext with RealTimeService, RealIdService, and FrameworkClient (via createFrameworkService())

## Component Interactions

1. **Service Creation**: Factory functions create service instances
   - `FakeTimeService()` → `TimeService` with stable values
   - `RealTimeService()` → `TimeService` with real Date.now()
   - `FakeIdService()` → `IdService` with predictable IDs
   - `RealIdService()` → `IdService` with crypto-based IDs

2. **Context Setup**: App context factories combine services
   - `FakeAppContext()` → Combines fake services + FrameworkClient
   - `RealAppContext()` → Combines real services + FrameworkClient

3. **Context Usage**: Application code accesses context via async local storage
   - Entry points (routes, middleware) call `runInContext(context, handler)`
   - Application code calls `appContext()` to get current services
   - Tests can use `runInContext(FakeAppContext(), testFn)` for isolated test contexts

4. **Service Access**: Services accessed through context
   ```typescript
   // In application code
   const ctx = appContext();
   const now = ctx.timeService.dateNowMs();
   const id = ctx.idService.secureUid();
   ```

## Design Decisions

1. **Factory Function Pattern**: Services use factory functions rather than classes, matching user preference
2. **Async Local Storage**: Context managed via async local storage for implicit dependency injection
3. **Browser Support**: Fake async local storage implementation for browser compatibility
4. **FrameworkClient Integration**: Keep existing `createFrameworkService()` factory, integrate into app context
5. **Naming**: Use `fake-*.ts` for fake implementations to avoid confusion with test files
6. **Utilities**: Copy base62/bigint utilities from reference implementation, keep self-contained
