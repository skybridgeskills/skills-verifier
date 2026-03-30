import type { AppContext } from './app-context.js';
import { createFrameworkService } from './clients/framework-client/framework-client.js';
import { RealIdService } from './services/id-service/real-id-service.js';
import { RealTimeService } from './services/time-service/real-time-service.js';
import { Providers } from './util/provider/providers.js';

/**
 * Provider chain that builds dev AppContext (real time, id, framework client).
 */
export const devAppProviders = Providers(
	async () => ({ timeService: RealTimeService() }),
	async () => ({ idService: RealIdService() }),
	async () => ({ frameworkClient: createFrameworkService() })
);

/**
 * Creates an AppContext for use in local development.
 */
export async function DevAppContext(): Promise<AppContext> {
	return (await devAppProviders()) as AppContext;
}
