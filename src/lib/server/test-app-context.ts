import type { AppContext } from './app-context.js';
import { FrameworkClientCtx } from './clients/framework-client/framework-client.js';
import { FakeIdServiceCtx } from './services/id-service/fake-id-service.js';
import { FakeTimeServiceCtx } from './services/time-service/fake-time-service.js';
import { Providers } from './util/provider/providers.js';

/**
 * Provider chain that builds test AppContext (fakes + framework client).
 */
export const testAppProviders = Providers(FakeTimeServiceCtx, FakeIdServiceCtx, FrameworkClientCtx);

/**
 * Creates an AppContext for use in unit tests.
 */
export async function TestAppContext(): Promise<AppContext> {
	return (await testAppProviders()) as AppContext;
}
