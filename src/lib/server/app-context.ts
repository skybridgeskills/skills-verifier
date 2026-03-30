import type { FrameworkClient } from './clients/framework-client/framework-client.js';
import type { IdService } from './services/id-service/id-service.js';
import type { TimeService } from './services/time-service/time-service.js';
import { panic } from './util/panic.js';
import {
	contextStore,
	providerCtx,
	runInContext as runInProviderContext,
	runWithExtraContext as runWithExtraProviderContext
} from './util/provider/provider-ctx.js';

/**
 * Application context containing all services.
 */
export interface AppContext {
	timeService: TimeService;
	idService: IdService;
	frameworkClient: FrameworkClient;
}

/** Re-export: same ALS instance as `providerCtx` / provider stack. */
export { contextStore };

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
 * Runs a function with the given AppContext.
 * The context is available via appContext() within the function.
 */
export function runInContext<T>(context: AppContext, fn: () => T): T {
	return runInProviderContext(context, fn);
}

/**
 * Extends the current context with additional properties and runs a function in it.
 * Merges the extra properties with the existing context.
 */
export function runWithExtraContext<T>(extra: Partial<AppContext>, fn: () => T): T {
	return runWithExtraProviderContext(extra, fn);
}
