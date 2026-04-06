import { FrameworkClientCtx } from '$lib/clients/framework-client/framework-client.js';

import type { AppContext } from './app-context.js';
import { FakeIdServiceCtx } from './services/id-service/fake-id-service.js';
import { FakeTimeServiceCtx } from './services/time-service/fake-time-service.js';
import { MemoryDatabase } from './storage/core/memory-database.js';
import { Providers } from './util/provider/providers.js';

/** In-memory DB only — tests never call DynamoDB. */
const TestStorageDatabaseCtx = () => ({ database: new MemoryDatabase() });

/**
 * Provider chain that builds test AppContext (fakes + framework client + memory DB).
 */
export const testAppProviders = Providers(
	FakeTimeServiceCtx,
	FakeIdServiceCtx,
	FrameworkClientCtx,
	TestStorageDatabaseCtx
);

/**
 * Creates an AppContext for use in unit tests.
 */
export async function TestAppContext(): Promise<AppContext> {
	return (await testAppProviders()) as AppContext;
}
