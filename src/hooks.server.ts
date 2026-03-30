import type { Handle } from '@sveltejs/kit';

import type { AppContext } from '$lib/server/app-context.js';
import { DevAppContext } from '$lib/server/dev-app-context.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';

async function getAppContext(): Promise<AppContext> {
	return DevAppContext();
}

/**
 * Runs each request inside dev app context so `appContext()` and `getFrameworkClient()`
 * resolve from ALS on the server.
 */
export const handle: Handle = async ({ event, resolve }) => {
	const ctx = await getAppContext();
	return runInContext(ctx, () => resolve(event));
};
