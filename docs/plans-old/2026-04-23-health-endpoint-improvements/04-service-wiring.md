# Phase 4 — Service wiring: Add HealthCheckSym to services

## Scope of phase

Add `[HealthCheckSym]` to service objects that have external dependencies.

**In scope:**

1. `credential-engine-skill-search-service.ts` — Add HTTP health check for CE API
2. `storage-database-ctx.ts` — Add DynamoDB health check

**Out of scope:**

- Core health modules (Phases 1-3)
- App context wiring (Phase 6)
- Endpoint wiring (Phase 5)

## Code organization reminders

- One line per service: `[HealthCheckSym]: XxxHealthCheck(...)`
- Import the check factory and symbol from the health module
- Keep the service interface unchanged — the symbol is an optional property

## Sub-agent reminders

- **Do not commit.**
- **Do not expand scope.** Only the two service files listed above.
- **Do not suppress warnings.**
- **Ensure TypeScript compiles** — the symbol property is optional but must be type-compatible.

## Implementation details

### File: `src/lib/server/services/skill-search/credential-engine/credential-engine-skill-search-service.ts`

Add `[HealthCheckSym]` using `HttpHealthCheck` from the health module.

```typescript
import { appLoggerSafe } from '$lib/server/services/logging/logger-service.js';

import type {
	RegistryContainerSearchResult,
	RegistryFrameworkSearchResult,
	SkillSearchQuery,
	SkillSearchResult,
	SkillSearchService
} from '../skill-search-service.js';

import {
	buildCredentialEngineContainerSearchRequest,
	buildCredentialEngineFrameworkSearchRequest,
	buildCredentialEngineSearchRequest
} from './credential-engine-search-request.js';
import {
	mapCredentialEngineContainerSearchResponse,
	mapCredentialEngineFrameworkSearchResponse
} from './map-credential-engine-registry-search-response.js';
import { mapCredentialEngineSearchResponse } from './map-credential-engine-search-response.js';
// NEW: Import health check
import { HealthCheckSym } from '../../../health/health-check.js';
import { HttpHealthCheck } from '../../../health/checks/http-health-check.js';

export interface CredentialEngineSkillSearchConfig {
	searchUrl: string;
	apiKey: string;
}

/** Credential Registry Search API client (server-only). */
async function postCredentialEngineSearch(
	config: CredentialEngineSkillSearchConfig,
	requestBody: unknown,
	logLabel: string
): Promise<unknown> {
	// ... existing implementation unchanged ...
}

export function CredentialEngineSkillSearchService(
	config: CredentialEngineSkillSearchConfig
): SkillSearchService {
	// The service methods remain unchanged
	return {
		async search(query: SkillSearchQuery): Promise<SkillSearchResult[]> {
			const requestBody = buildCredentialEngineSearchRequest(query, config.searchUrl);
			const ceResponse = await postCredentialEngineSearch(config, requestBody, 'CE skill search');
			return mapCredentialEngineSearchResponse(ceResponse);
		},

		async searchContainers(query: SkillSearchQuery): Promise<RegistryContainerSearchResult[]> {
			const requestBody = buildCredentialEngineContainerSearchRequest(query, config.searchUrl);
			const ceResponse = await postCredentialEngineSearch(
				config,
				requestBody,
				'CE container search'
			);
			return mapCredentialEngineContainerSearchResponse(ceResponse);
		},

		async searchFrameworks(query: SkillSearchQuery): Promise<RegistryFrameworkSearchResult[]> {
			const requestBody = buildCredentialEngineFrameworkSearchRequest(query, config.searchUrl);
			const ceResponse = await postCredentialEngineSearch(
				config,
				requestBody,
				'CE framework search'
			);
			return mapCredentialEngineFrameworkSearchResponse(ceResponse);
		},

		// NEW: Health check symbol property
		[HealthCheckSym]: HttpHealthCheck({
			name: 'credential-engine',
			baseUrl: extractBaseUrl(config.searchUrl),
			path: '/health',
			apiKey: config.apiKey
		})
	};
}

// ---------------------------------------------------------------------------
// helpers

/**
 * Extracts the base URL from the CE search URL.
 * Input: https://sandbox.credentialengine.org/assistant/search/ctdl
 * Output: https://sandbox.credentialengine.org
 */
function extractBaseUrl(searchUrl: string): string {
	try {
		const url = new URL(searchUrl);
		// Remove any path beyond the origin
		return `${url.protocol}//${url.host}`;
	} catch {
		// If URL parsing fails, try simple string replacement
		return searchUrl.replace(/\/assistant\/search.*$/, '').replace(/\/$/, '');
	}
}
```

### File: `src/lib/server/core/storage/storage-database-ctx.ts`

The DynamoDB context is created in this file. We need to add `[HealthCheckSym]` to the returned database context.

Read the current file first to understand its structure, then add the health check.

Expected changes:

```typescript
// NEW imports
import { HealthCheckSym } from '../../health/health-check.js';
import { DynamoDBHealthCheck } from '../../health/checks/dynamodb-health-check.js';

// In the provider function, when returning the database context:
return {
	// ... existing database methods ...

	// NEW: Health check symbol property
	[HealthCheckSym]: DynamoDBHealthCheck({
		client: dynamoClient,
		tableName: env.DYNAMODB_TABLE
	})
};
```

Note: You may need to adjust the exact structure based on how `StorageDatabaseCtx` is implemented. The key is to:

1. Access the DynamoDB client instance
2. Get the table name from env
3. Attach `[HealthCheckSym]` with `DynamoDBHealthCheck(...)` to the returned object

## Validate

```bash
pnpm check
```

## Definition of done

- `credential-engine-skill-search-service.ts` has `[HealthCheckSym]` property with `HttpHealthCheck`
- `storage-database-ctx.ts` has `[HealthCheckSym]` property with `DynamoDBHealthCheck`
- TypeScript compiles without errors
- No other files modified
