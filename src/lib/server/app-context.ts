import {
	createFrameworkService,
	type FrameworkClient
} from './clients/framework-client/framework-client.js';
import type { IdService } from './services/id-service/id-service.js';
import type { TimeService } from './services/time-service/time-service.js';
import { panic } from './util/panic.js';
import { contextStore, providerCtx, providerCtxSafe } from './util/provider/provider-ctx.js';

/**
 * Application context containing all services.
 */
export interface AppContext {
	timeService: TimeService;
	idService: IdService;
	frameworkClient: FrameworkClient;
}

/**
 * Gets the current AppContext from async local storage.
 * Throws an error if no context is present.
 */
export function appContext(): AppContext {
	if (!contextStore.getStore()) {
		panic('No app context present. Ensure runInContext() is called before accessing appContext().');
	}
	return providerCtx<AppContext>();
}

/**
 * Framework client for UI code that may run outside a request ALS (e.g. client-side $effect).
 * Uses app context when set (see hooks.server.ts); otherwise {@link createFrameworkService}.
 */
export function getFrameworkClient(): FrameworkClient {
	const fromCtx = providerCtxSafe<AppContext>().frameworkClient;
	if (fromCtx !== undefined) {
		return fromCtx;
	}
	return createFrameworkService();
}
