import type { FrameworkClient } from '$lib/clients/framework-client/framework-client.js';

import type { StorageDatabase } from './core/storage/types.js';
import type { IdService } from './services/id-service/id-service.js';
import type { SkillSearchService } from './services/skill-search/skill-search-service.js';
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
	database: StorageDatabase;
	skillSearchService: SkillSearchService;
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
 * Framework client from request ALS (see hooks.server.ts).
 * Server-only — throws if no context is present.
 */
export function getFrameworkClient(): FrameworkClient {
	const fromCtx = providerCtxSafe<AppContext>().frameworkClient;
	if (fromCtx !== undefined) {
		return fromCtx;
	}
	panic(
		'No app context present. Ensure runInContext() is called before accessing getFrameworkClient().'
	);
}
