# Phase 2: DynamoDB storage factory and AWS env validation

## Scope of phase

Enable **real DynamoDB** when running **`CONTEXT=aws`**: implement **`DynamoStorageDatabase`** construction in **`createStorageDatabase()`**, require **`DYNAMODB_TABLE`** (and region via **`AWS_REGION`** or **`AWS_DEFAULT_REGION`**) in **AWS env parsing**, and fix **`StorageDatabaseCtx`** initialization logging (dynamo vs memory).

## Code Organization Reminders

- Prefer granular file structure, one concept per file.
- Place more abstract things, entry points, and tests **first**.
- Place helper utility functions **at the bottom** of files.
- Keep related functionality grouped together.
- Any temporary code should have a TODO comment so we can find it later.

## Implementation Details

1. **`src/lib/server/core/storage/storage-database-factory.ts`**
   - When **`CONTEXT=aws`** (read from env the same way other server code does — today factory uses `process.env`; SvelteKit injects private env into Node — keep consistent with **`dynamo-client.ts`**), **`DYNAMODB_TABLE`** non-empty:
     - Build **`DynamoDBDocumentClient.from(DynamoDBClient)`** (or extend **`createDynamoDbClient`** / add **`createDynamoDocumentClient`** in **`dynamo-client.ts`**).
     - Return `{ $type: 'dynamo', docClient, tableName }`.
   - When **`CONTEXT=aws`** and table missing: **fail fast** at startup (Zod in **`AwsAppContext`** path is preferred so misconfiguration is explicit).
   - **`dev` / `test`**: keep **MemoryDatabase** (ignore **`DYNAMODB_TABLE`** or allow optional local Dynamo later — default: memory only for non-aws).
   - Remove the “table set but not enabled” warning branch once Dynamo is implemented.

2. **`src/lib/server/aws-app-context.ts`**
   - Extend **`AwsEnv`** Zod schema with **`DYNAMODB_TABLE`** and **`AWS_REGION`** (or document default region and require explicit region in ECS task env).

3. **`src/lib/server/core/storage/storage-database-ctx.ts`**
   - Log **`dynamo`** vs **`memory`** via **`logServiceInitialized`** (or equivalent) based on **`database.$type`**.

4. **`seedDevDataIfNeeded`** already no-ops for non-memory — no change required unless imports need adjustment.

## Tests

- Unit tests for **`createStorageDatabase`** with **mocked env**:
  - **`CONTEXT=test`** → memory.
  - **`CONTEXT=aws`** + table + region → returns dynamo type (mock **`DynamoDBClient`** construction or test via thin injectable factory if needed — prefer minimal mocking).
- Run existing storage/query tests under **`CONTEXT=test`**.

## Validate

```bash
pnpm check
CONTEXT=test pnpm test:vitest
```
