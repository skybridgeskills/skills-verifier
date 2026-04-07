import type { Handle, HandleServerError, ServerInit } from '@sveltejs/kit';

import type { AppContext } from '$lib/server/app-context.js';
import { buildAppContext } from '$lib/server/build-app-context.js';
import { seedDevDataIfNeeded } from '$lib/server/core/storage/seed-dev-data.js';
import { appLogger, appLoggerSafe } from '$lib/server/services/logging/index.js';
import { panic } from '$lib/server/util/panic.js';
import { runInContext, runWithExtraContext } from '$lib/server/util/provider/provider-ctx.js';

import { env } from '$env/dynamic/private';

let serverAppContext: AppContext | undefined;

export const init: ServerInit = async () => {
	serverAppContext = await buildAppContext(env as Record<string, unknown>);
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
	const requestId = serverAppContext.idService.uniqueUid();
	event.locals.requestId = requestId;
	return runInContext(serverAppContext, () =>
		runWithExtraContext({ logger: serverAppContext!.logger.child({ requestId }) }, async () => {
			appLogger().info(
				{ method: event.request.method, path: event.url.pathname },
				'request started'
			);
			const response = await resolve(event);
			appLogger().info({ status: response.status }, 'request completed');
			return response;
		})
	);
};

export const handleError: HandleServerError = ({ error, event }) => {
	const requestId = event.locals.requestId;
	const log = appLoggerSafe();
	if (log) {
		log.error({ err: error, requestId }, 'unhandled server error');
	} else {
		console.error('unhandled server error', { requestId, error });
	}
};
