import { provideFakeFrameworkClient } from '$lib/clients/framework-client/framework-client.js';

import type { AppContext } from './app-context.js';
import { MemoryDatabase } from './core/storage/memory-database.js';
import { provideHealthRegistry } from './health/provide-health-registry.js';
import { FakeIdServiceCtx } from './services/id-service/fake-id-service.js';
import { FakeLoggerServiceCtx } from './services/logging/fake-logger-service.js';
import { provideFakeSkillSearchService } from './services/skill-search/provide-fake-skill-search-service.js';
import { FakeTimeServiceCtx } from './services/time-service/fake-time-service.js';
import { logServiceInitialized } from './util/log-service-initialized.js';
import { Providers } from './util/provider/providers.js';

const TestStorageDatabaseCtx = () => {
	const database = new MemoryDatabase();
	logServiceInitialized('database', 'memory');
	return { database };
};

/**
 * Test AppContext: deterministic fakes, in-memory DB, fake framework client, fake skill search.
 * Accepts `env` for API parity; CE is never used here.
 */
export async function TestAppContext(_env: Record<string, unknown> = {}): Promise<AppContext> {
	return (await Providers(
		FakeLoggerServiceCtx(),
		FakeTimeServiceCtx,
		FakeIdServiceCtx,
		provideFakeFrameworkClient,
		TestStorageDatabaseCtx,
		provideFakeSkillSearchService,
		provideHealthRegistry
	)()) as AppContext;
}
