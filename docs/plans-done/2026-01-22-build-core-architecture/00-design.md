# Design

## File Structure

```
src/lib/
├── core/                                    # NEW: Core app context system
│   ├── app-context.ts                       # NEW: getApp(), AppContext type, provider context
│   ├── app-context.test.ts                  # NEW: Tests for app context
│   ├── app-main.ts                          # NEW: DevApp, TestApp, AwsApp factories
│   ├── app-main.test.ts                     # NEW: Tests for app factories
│   └── bootstrap-ctx.ts                     # NEW: Bootstrap context (startup info)
│
├── services/                                # UPDATE: Reorganize services
│   ├── skills-framework-service/            # UPDATE: Rename from framework-service
│   │   ├── schema.ts                        # NEW: Zod schemas for Framework, Skill
│   │   ├── schema.test.ts                   # NEW: Tests for schemas
│   │   ├── skills-framework-service.ts      # NEW: Interface definition
│   │   ├── http-skills-framework-service.ts # UPDATE: Rename from HttpFrameworkService
│   │   ├── http-skills-framework-service.test.ts # NEW: Tests for HTTP service
│   │   └── static-skills-framework-service.ts # UPDATE: Rename from FakeFrameworkService
│   │
│   ├── time-service/                       # NEW
│   │   ├── time-service.ts                 # NEW: Interface, timeService() accessor
│   │   ├── time-service.test.ts            # NEW: Tests for time service
│   │   ├── fake-time-service.ts            # NEW: FakeTimeService for tests
│   │   └── fake-time-service.test.ts       # NEW: Tests for fake time service
│   │
│   ├── crypto-service/                     # NEW
│   │   ├── crypto-service.ts               # NEW: Interface, cryptoService() accessor
│   │   ├── crypto-service.test.ts          # NEW: Tests for crypto service
│   │   ├── fake-crypto-service.ts          # NEW: FakeCryptoService for tests
│   │   ├── fake-crypto-service.test.ts     # NEW: Tests for fake crypto service
│   │   ├── base62-uid.ts                   # NEW: Copied from monorepo, adapted
│   │   └── base62-uid.test.ts              # NEW: Tests for ID generation
│   │
│   ├── config-service/                     # NEW
│   │   ├── schema.ts                       # NEW: Zod schema for config
│   │   ├── schema.test.ts                  # NEW: Tests for config schema
│   │   ├── config-service.ts               # NEW: Interface, configService() accessor
│   │   ├── config-service.test.ts          # NEW: Tests for config service
│   │   └── env-config.ts                   # NEW: Parse env vars, provide config
│   │
│   └── stores/                              # NEW: Storage services
│       ├── datastore-service/               # NEW: Lower-level datastore service
│       │   ├── datastore-service.ts         # NEW: DatastoreService interface
│       │   ├── datastore-service.test.ts    # NEW: Tests for interface
│       │   ├── memory-datastore.ts          # NEW: In-memory implementation
│       │   ├── memory-datastore.test.ts     # NEW: Tests for memory datastore
│       │   ├── dynamo-datastore.ts          # NEW: DynamoDB implementation (future)
│       │   └── dynamo-datastore.test.ts     # NEW: Tests for DynamoDB datastore
│       │
│       ├── key-value-store.ts               # NEW: Generic KeyValueStore interface (used by stores)
│       ├── key-value-store.test.ts          # NEW: Tests for interface
│       │
│       ├── job-posting-store/               # NEW
│       │   ├── schema.ts                    # NEW: JobPostingIndex, JobPostingContent schemas
│       │   ├── schema.test.ts               # NEW: Tests for schemas
│       │   ├── job-posting-store.ts         # NEW: Interface definition
│       │   ├── job-posting-store-impl.ts   # NEW: Implementation (datastore-agnostic)
│       │   └── job-posting-store-impl.test.ts # NEW: Tests for store implementation
│       │
│       └── submission-store/                # NEW
│           ├── schema.ts                    # NEW: Submission schema
│           ├── schema.test.ts               # NEW: Tests for schema
│           ├── submission-store.ts          # NEW: Interface definition
│           ├── submission-store-impl.ts     # NEW: Implementation (datastore-agnostic)
│           └── submission-store-impl.test.ts # NEW: Tests for store implementation
│
├── util/                                    # NEW: Utility functions
│   └── id.ts                                # NEW: ID generation helpers (re-export from crypto-service)
│
├── testing/                                 # NEW: Testing utilities
│   ├── test-app.ts                          # NEW: TestApp factory for creating test contexts
│   ├── test-app.test.ts                     # NEW: Tests for test app factory
│   ├── provider-test.ts                     # NEW: Test wrapper for vitest (like monorepo)
│   └── fixtures/                            # NEW: Test data fixtures
│       ├── job-postings.ts                  # NEW: Sample job posting data
│       └── submissions.ts                   # NEW: Sample submission data
│
├── types/                                   # UPDATE: Add new types
│   ├── job-profile.ts                       # UPDATE: Add JobPostingIndex, JobPostingContent, Submission types
│   └── app-context.ts                       # NEW: AppContext type exports
│
├── components/                              # EXISTING: Keep as-is
├── config/                                  # EXISTING: Keep as-is
├── pages/                                   # EXISTING: Keep as-is
└── index.ts                                 # UPDATE: Export core types/services

src/routes/                                  # UPDATE: Add app context handling
├── +hooks.server.ts                         # NEW: Create handleAppContext hook
└── ...existing routes...                    # EXISTING

turbo.json                                   # NEW: Turbo configuration
.husky/                                      # NEW: Git hooks for conventional commits
.github/workflows/                           # NEW: CI/CD workflows
└── pr.yml                                   # NEW: PR validation workflow
```

## Conceptual Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SvelteKit Routes                           │
│  (+hooks.server.ts creates app context per request)           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    App Context Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  getApp() → AppContext                                 │   │
│  │  - Uses AsyncLocalStorage (provider-ctx)               │   │
│  │  - Available in routes, services, tests                │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Services   │ │    Stores     │ │   Config     │
│              │ │               │ │              │
│ • Skills     │ │ • JobPosting  │ │ • Config     │
│   Framework  │ │   Store       │ │   Service    │
│ • Time       │ │ • Submission  │ │              │
│ • Crypto     │ │   Store       │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │
        │               ▼
        │      ┌─────────────────┐
        │      │  Datastore       │
        │      │  Service         │
        │      │  (Connection     │
        │      │   Management)    │
        │      └────────┬────────┘
        │               │
        │      ┌────────┴────────┐
        │      │                 │
        ▼      ▼                 ▼
┌──────────────┐      ┌──────────────────┐
│   Memory     │      │   DynamoDB        │
│   Datastore  │      │   Datastore       │
│   (Dev/Test) │      │   (Production)    │
│   - No conn  │      │   - Connection    │
│   - Map ops  │      │     pooling       │
└──────────────┘      └──────────────────┘

App Context Creation:
┌─────────────────────────────────────────────┐
│  DevApp / TestApp / AwsApp                   │
│  ┌───────────────────────────────────────┐  │
│  │ Providers(                             │  │
│  │   bootstrapCtx,                        │  │
│  │   configService,                       │  │
│  │   timeService,                         │  │
│  │   cryptoService,                       │  │
│  │   skillsFrameworkService,              │  │
│  │   // Select datastore based on config  │  │
│  │   (ctx) => ctx.appEnv.DYNAMODB_TABLE   │  │
│  │     ? provideDynamoDatastore(ctx)      │  │
│  │     : provideMemoryDatastore(),        │  │
│  │   jobPostingStore,                     │  │
│  │   submissionStore,                     │  │
│  │ )                                      │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Key Design Decisions

1. **Provider Pattern**: Uses the same provider system as the monorepo (`@repo/lib-util/util/provider`) for dependency injection and testability.

   The provider system is a way to declare and build application context objects. It's designed to allow clear, concise, and reusable tests and fixtures.

   **Key Concepts:**
   - **Provider Functions**: Functions that return objects with one or more keys. By convention, named `provide<Something>()` and return `{ <something>: ... }`.

     ```typescript
     function provideConfig() {
     	return { config: { idPrefix: 'test-' } };
     }
     ```

   - **Provider Dependencies**: Providers can depend on other providers by accepting context as a parameter.

     ```typescript
     function provideData({ config }: ConfigCtx) {
     	return { data: { userId: config.idPrefix + '123' } };
     }
     ```

   - **Provider Chains**: Combine providers using `Providers()` utility.

     ```typescript
     const provideAppCtx = Providers(provideConfig, provideData, provideTimeService);
     ```

   - **Context Access**: In code, access context via `providerCtx<AppContext>()` or `getApp()` (which wraps providerCtx). In tests, context is passed as a parameter.

     ```typescript
     // In application code
     const ctx = getApp();
     const config = ctx.config;

     // In tests
     it('test name', provideAppCtx, async (ctx) => {
     	expect(ctx.config.idPrefix).toBe('test-');
     });
     ```

   - **Provider Factories**: Functions that return providers, useful for configuration overrides. Named `<Something>Provider` by convention.

     ```typescript
     function ConfigOverrideProvider(override: Partial<Config>) {
     	return () => ({ config: { ...existingConfig, ...override } });
     }
     ```

   - **Type Safety**: Use `OutputOfProvider<typeof provideSomething>` to get the context type from a provider.
     ```typescript
     type ConfigCtx = OutputOfProvider<typeof provideConfig>;
     ```

   This pattern enables:
   - **Testability**: Easy to create test contexts with fake services
   - **Dependency Injection**: Services receive dependencies through context
   - **Reusability**: Provider chains can be composed and reused
   - **Type Safety**: Full TypeScript support for context types

   **Example for skills-verifier:**

   ```typescript
   // Define providers
   function provideConfig() { return { config: configService() }; }
   function provideTimeService() { return { timeService: fakeTimeService() }; }
   function provideMemoryDatastore() { return { datastore: MemoryDatastore() }; }
   function provideJobPostingStore({ datastore, timeService }: DatastoreCtx & TimeServiceCtx) {
     return { jobPostingStore: JobPostingStoreImpl(datastore, timeService) };
   }

   // Combine into app context
   const provideTestApp = Providers(
     provideConfig,
     provideTimeService,
     provideMemoryDatastore,
     provideJobPostingStore  // Works with any datastore
   );

   // Use in tests
   it('creates job posting', provideTestApp, async (ctx) => {
     const posting = await ctx.jobPostingStore.create({ ... });
   });

   // Use in application code (via getApp())
   function createJobPosting(data: JobPostingData) {
     const ctx = getApp();
     return ctx.jobPostingStore.create(data);
   }
   ```

2. **Service Interfaces**: Each service defines an interface with both real and fake/test implementations.

   **Service Interface Pattern:**

   Each service follows this structure:

   ```typescript
   // 1. Define the service interface
   export interface JobPostingStore {
   	create(data: JobPostingContent): Promise<JobPostingContent>;
   	getById(id: string): Promise<JobPostingContent | null>;
   	// ... other methods
   }

   // 2. Define the context type
   export interface JobPostingStoreCtx {
   	jobPostingStore: JobPostingStore;
   }

   // 3. Create accessor function
   export function jobPostingStore() {
   	return providerCtx<JobPostingStoreCtx>().jobPostingStore;
   }
   ```

   **Service Implementation:**

   Store implementations are datastore-agnostic - they work with any DatastoreService:

   ```typescript
   // Single implementation that works with any datastore
   export function provideJobPostingStore({
   	datastore,
   	timeService
   }: DatastoreCtx & TimeServiceCtx): JobPostingStoreCtx {
   	return {
   		jobPostingStore: JobPostingStoreImpl(datastore, timeService)
   	};
   }

   // The implementation uses the DatastoreService interface
   function JobPostingStoreImpl(
   	datastore: DatastoreService,
   	timeService: TimeService
   ): JobPostingStore {
   	return {
   		async create(data: JobPostingContent) {
   			const key = `sv:job-content:${data.id}`;
   			await datastore.put(key, data);
   			return data;
   		},
   		async getById(id: string) {
   			const key = `sv:job-content:${id}`;
   			return await datastore.get<JobPostingContent>(key);
   		}
   		// ... other methods use datastore.get/put/delete
   	};
   }
   ```

   **Service Selection Based on Config:**

   During app bootstrap, only the datastore is selected based on configuration. Stores use whatever datastore is provided:

   ```typescript
   // In app-main.ts or dev-app-services.ts
   export const provideAppServicesForDev = Providers(
   	(ctx: AppEnvCtx) => ctx, // Config is available

   	// Select datastore based on config
   	(ctx: AppEnvCtx) =>
   		ctx.appEnv.DYNAMODB_TABLE_NAME // or processed config value from a previously provided configService
   			? provideDynamoDatastore(ctx)
   			: provideMemoryDatastore(),

   	provideJobPostingStore,
   	provideSubmissionStore
   );
   ```

   This pattern enables:
   - **Environment-specific implementations**: Different services for dev/test vs production
   - **Configuration-driven selection**: Services chosen based on env vars/config
   - **Dependency injection**: Services receive dependencies (like datastore) through context
   - **Testability**: Easy to swap implementations for testing

3. **Storage Abstraction**: Multi-layer storage architecture with connection management.

   **Lower-Level Datastore Service:**

   A base `DatastoreService` manages connections, connection pools, and provides the generic key-value operations. This is used by higher-level stores (JobPostingStore, SubmissionStore).

   ```typescript
   export interface DatastoreService {
   	$type: 'MemoryDatastore' | 'DynamoDatastore';
   	get(key: string): Promise<unknown | null>;
   	put(key: string, value: unknown): Promise<void>;
   	delete(key: string): Promise<void>;
   	// Connection management methods
   	close?(): Promise<void>;
   }

   export interface DatastoreCtx {
   	datastore: DatastoreService;
   }
   ```

   **KeyValueStore Interface:**

   Generic interface for key-value operations, implemented by the datastore service:

   ```typescript
   export interface KeyValueStore {
   	get<T>(key: string): Promise<T | null>;
   	put<T>(key: string, value: T): Promise<void>;
   	delete(key: string): Promise<void>;
   }
   ```

   **Store Implementations:**

   Higher-level stores (JobPostingStore, SubmissionStore) are datastore-agnostic - they use the DatastoreService interface and work with any implementation:

   ```typescript
   function JobPostingStoreImpl(
   	datastore: DatastoreService,
   	timeService: TimeService
   ): JobPostingStore {
   	return {
   		async create(data: JobPostingContent) {
   			const key = `sv:job-content:${data.id}`;
   			await datastore.put(key, data);
   			return data;
   		},
   		async getById(id: string) {
   			const key = `sv:job-content:${id}`;
   			return await datastore.get<JobPostingContent>(key);
   		}
   		// ... other methods use datastore.get/put/delete
   		// Works with both MemoryDatastore and DynamoDatastore
   	};
   }
   ```

   **Connection Management:**

   The datastore service handles connection pooling and lifecycle:
   - **MemoryDatastore**: No connections needed, just in-memory Map
   - **DynamoDatastore**: Manages AWS SDK client, connection pool, handles reconnection

   This separation allows:
   - **Connection reuse**: One datastore instance shared by multiple stores
   - **Lifecycle management**: Proper connection cleanup on app shutdown
   - **Testability**: Memory datastore for tests, real datastore for production
   - **Store simplicity**: Stores don't need to know about underlying datastore implementation - they just use the interface

4. **Two-Level Posting Structure**: `JobPostingIndex` (`sv:job:<id>`) tracks versions, `JobPostingContent` (`sv:job-content:<id>`) stores immutable content.

5. **Test Fixtures**: In-memory store populated with test data on startup for development.

6. **App Context**: Available via `getApp()` in routes, services, and tests using AsyncLocalStorage.

7. **Co-located Tests**: All test files use `.test.ts` naming convention and are siblings of their source files.

## Data Flow Example

```
User Request → SvelteKit Route
  → +hooks.server.ts creates app context
    → App context providers select services based on config
      → If DYNAMODB_TABLE_NAME set: provideDynamoDatastore
      → Else: provideMemoryDatastore
      → JobPostingStore uses selected datastore
  → Route handler calls getApp()
  → Service (e.g., jobPostingStore) accesses via getApp()
  → Store calls datastore.get/put/delete
  → Datastore service handles connection/operations
    → MemoryDatastore: Direct Map operations
    → DynamoDatastore: AWS SDK calls with connection pooling
  → Returns data through context
```

## Data Structures

### JobPostingIndex (`sv:job:<id>`)

```typescript
{
  id: "sv:job:<id>",
  currentVersionId: "sv:job-content:<id>",
  versions: [
    { id: "sv:job-content:<id>", createdAt: <timestamp> },
    ...
  ]
}
```

### JobPostingContent (`sv:job-content:<id>`)

```typescript
{
  id: "sv:job-content:<id>",
  jobPostingId: "sv:job:<id>",
  // ... job posting content fields (name, description, company, frameworks, skills)
}
```

### Submission

```typescript
{
  id: "sv:submission:<unguessable-id>",
  jobPostingId: "sv:job:<id>",
  jobPostingContentId: "sv:job-content:<id>",
  // ... submission data
}
```
