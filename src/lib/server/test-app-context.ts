import { FrameworkClientCtx } from '$lib/clients/framework-client/framework-client.js';

import type { AppContext } from './app-context.js';
import { MemoryDatabase } from './core/storage/memory-database.js';
import { FakeIdServiceCtx } from './services/id-service/fake-id-service.js';
import { provideFakeSkillSearchService } from './services/skill-search/provide-fake-skill-search-service.js';
import { FakeTimeServiceCtx } from './services/time-service/fake-time-service.js';
import { Providers } from './util/provider/providers.js';

const TestStorageDatabaseCtx = () => ({ database: new MemoryDatabase() });

/**
 * Test AppContext: deterministic fakes, in-memory DB, fake skill search.
 * Accepts `env` for API parity; skill search never uses CE here.
 */
export async function TestAppContext(_env: Record<string, unknown> = {}): Promise<AppContext> {
	return (await Providers(
		FakeTimeServiceCtx,
		FakeIdServiceCtx,
		FrameworkClientCtx,
		TestStorageDatabaseCtx,
		provideFakeSkillSearchService
	)()) as AppContext;
}
