import type { Handle, ServerInit } from '@sveltejs/kit';

import type { AppContext } from '$lib/server/app-context.js';
import { seedDevDataIfNeeded } from '$lib/server/core/storage/seed-dev-data.js';
import { DevAppContext } from '$lib/server/dev-app-context.js';
import { panic } from '$lib/server/util/panic.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';

let serverAppContext: AppContext | undefined;

export const init: ServerInit = async () => {
	serverAppContext = await DevAppContext();
	await runInContext(serverAppContext, async () => {
		await seedDevDataIfNeeded(serverAppContext!);
	});
};

/**
 * Runs each request inside the shared app context so server code can use `appContext()`.
 */
export const handle: Handle = async ({ event, resolve }) => {
	if (!serverAppContext) {
		panic('App context was not initialized. Ensure hooks init ran before handling requests.');
	}
	return runInContext(serverAppContext, () => resolve(event));
};
