import { FrameworkClientCtx } from '$lib/clients/framework-client/framework-client.js';

import type { AppContext } from './app-context.js';
import { RealIdServiceCtx } from './services/id-service/real-id-service.js';
import { RealTimeServiceCtx } from './services/time-service/real-time-service.js';
import { Providers } from './util/provider/providers.js';

/**
 * Provider chain that builds dev AppContext (real time, id, framework client).
 */
export const devAppProviders = Providers(RealTimeServiceCtx, RealIdServiceCtx, FrameworkClientCtx);

/**
 * Creates an AppContext for use in local development.
 */
export async function DevAppContext(): Promise<AppContext> {
	return (await devAppProviders()) as AppContext;
}
