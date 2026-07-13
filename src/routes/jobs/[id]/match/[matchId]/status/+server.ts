import { json } from '@sveltejs/kit';

import { appContext } from '$lib/server/app-context.js';
import { matchByIdQuery } from '$lib/server/domain/match/match-by-id-query.js';
import { saveMatchCredentialsQuery } from '$lib/server/domain/match/save-match-credentials-query.js';
import { appLogger } from '$lib/server/services/logging/index.js';

import type { RequestHandler } from './$types';

/**
 * Poll the verify-exchange status for a match. The browser hits this every ~2-3s (P4).
 * `exchangeId`/`vcapi` are read from the persisted match (server-trusted), never from
 * client-supplied values. On `complete`/`invalid` the new state is persisted.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const match = await matchByIdQuery({ id: params.matchId });
	if (!match || match.jobId !== params.id) {
		return json({ error: 'Match not found' }, { status: 404 });
	}

	if (!match.exchangeId || !match.vcapi) {
		return json({ state: 'none' });
	}

	const { verificationExchange } = appContext();
	let status;
	try {
		status = await verificationExchange.getExchangeStatus({
			exchangeId: match.exchangeId,
			vcapi: match.vcapi
		});
	} catch (err) {
		appLogger().error(
			{ err, matchId: params.matchId, requestId: locals.requestId },
			'status: failed to poll exchange status'
		);
		return json({ error: 'Could not poll exchange status' }, { status: 502 });
	}

	// A verifier-core result is available for both `complete` and `invalid`; persist and return
	// the credentials + presentation problems for either so the applicant can still build a match.
	// On `invalid` with no usable result (empty creds/problems) the UI keeps the invalid state.
	if (status.state === 'complete' || status.state === 'invalid') {
		await saveMatchCredentialsQuery({
			id: match.id,
			exchangeId: match.exchangeId,
			vcapi: match.vcapi,
			exchangeState: status.state,
			verifiedCredentials: status.verifiedCredentials,
			presentationProblems: status.presentationProblems
		});
		return json({
			state: status.state,
			verifiedCredentials: status.verifiedCredentials,
			presentationProblems: status.presentationProblems
		});
	}

	return json({ state: status.state });
};
