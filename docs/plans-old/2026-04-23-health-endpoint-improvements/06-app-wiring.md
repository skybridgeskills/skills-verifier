# Phase 6 — App wiring: Append provideHealthRegistry to provider chains

## Scope of phase

Append `provideHealthRegistry` to each app context provider chain so the registry is built once after services are constructed.

**In scope:**

1. `src/lib/server/aws-app-context.ts` — AWS/production context
2. `src/lib/server/dev-app-context.ts` — Dev context
3. `src/lib/server/test-app-context.ts` — Test context

**Out of scope:**

- Core health modules (Phases 1-3)
- Service wiring (Phase 4)
- Endpoint wiring (Phase 5)

## Code organization reminders

- Append `provideHealthRegistry` as the **last** provider in each chain
- Import the provider from the health module
- Ensure TypeScript types are satisfied

## Sub-agent reminders

- **Do not commit.**
- **Do not expand scope.** Only the three context files listed.
- **Do not suppress warnings.**
- **Do not skip or weaken existing tests.**

## Implementation details

### File: `src/lib/server/aws-app-context.ts`

Current structure (from analysis):

```typescript
return (await Providers(
  RealLoggerServiceCtx({ level: 'info', pretty: false }),
  RealTimeServiceCtx,
  RealIdServiceCtx,
  provideHttpFrameworkClient,
  StorageDatabaseCtx(env),
  () => provideCredentialEngineSkillSearchService({...}),
)()) as AppContext;
```

Change to:

```typescript
import { provideHealthRegistry } from './health/provide-health-registry.js';

// ...

return (await Providers(
  RealLoggerServiceCtx({ level: 'info', pretty: false }),
  RealTimeServiceCtx,
  RealIdServiceCtx,
  provideHttpFrameworkClient,
  StorageDatabaseCtx(env),
  () => provideCredentialEngineSkillSearchService({...}),
  provideHealthRegistry,  // ← NEW: last in chain
)()) as AppContext;
```

### File: `src/lib/server/dev-app-context.ts`

Read the current file and append `provideHealthRegistry` as the last provider. The dev context uses fake/stub services, so the registry will likely be empty (which is correct — `runAll()` returns `{ status: 'UP', components: {} }`).

Expected pattern:

```typescript
import { provideHealthRegistry } from './health/provide-health-registry.js';

// ...

return (await Providers(
	RealLoggerServiceCtx({ level: 'debug', pretty: true }),
	RealTimeServiceCtx,
	RealIdServiceCtx,
	// ... other dev providers ...
	provideHealthRegistry // ← NEW: last in chain
)()) as AppContext;
```

### File: `src/lib/server/test-app-context.ts`

Read the current file and append `provideHealthRegistry` as the last provider.

Expected pattern:

```typescript
import { provideHealthRegistry } from './health/provide-health-registry.js';

// ...

return (await Providers(
	// ... test providers ...
	provideHealthRegistry // ← NEW: last in chain
)()) as AppContext;
```

## Validate

```bash
pnpm check
pnpm test:vitest
```

Run a quick integration check:

```bash
# Start the dev server and verify the endpoint works
pnpm dev &
sleep 5
curl http://localhost:5173/health/ready
```

Expected response (dev context has no real dependencies, so registry is empty):

```json
{
	"status": "UP",
	"service.name": "skills-verifier",
	"service.version": "...",
	"deployment.environment": "dev",
	"startupTime": "...",
	"timestamp": "...",
	"components": {}
}
```

## Definition of done

- `provideHealthRegistry` appended to all three provider chains
- TypeScript compiles without errors
- All existing tests pass
- Manual verification of `/health/ready` endpoint works
