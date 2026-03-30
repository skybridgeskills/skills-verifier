import type { AppContext } from './app-context.js';
import { createFrameworkService } from './clients/framework-client/framework-client.js';
import { FakeIdService } from './services/id-service/fake-id-service.js';
import { FakeTimeService } from './services/time-service/fake-time-service.js';
import { Providers } from './util/provider/providers.js';

/**
 * Provider chain that builds test AppContext (fakes + framework client).
 */
export const testAppProviders = Providers(
	async () => ({ timeService: FakeTimeService() }),
	async () => ({ idService: FakeIdService() }),
	async () => ({ frameworkClient: createFrameworkService() })
);

/**
 * Creates an AppContext for use in unit tests.
 */
export async function TestAppContext(): Promise<AppContext> {
	return (await testAppProviders()) as AppContext;
}
