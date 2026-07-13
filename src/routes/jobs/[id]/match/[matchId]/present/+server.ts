import { json } from '@sveltejs/kit';

import { appContext } from '$lib/server/app-context.js';
import { matchByIdQuery } from '$lib/server/domain/match/match-by-id-query.js';
import {
	isMatchExpired,
	verifyMatchCapability
} from '$lib/server/domain/match/match-capability.js';
import { saveMatchCredentialsQuery } from '$lib/server/domain/match/save-match-credentials-query.js';
import { VerificationExchangeError } from '$lib/server/domain/verification/parse-exchange-response.js';
import { appLogger } from '$lib/server/services/logging/index.js';

import type { RequestHandler } from './$types';

/** Current wall-clock time from the injected time service (never `Date.now()` directly). */
function now(): Date {
	return new Date(appContext().timeService.dateNowMs());
}

/**
 * Relay a client-obtained Verifiable Presentation into the match's active verify exchange so the
 * transaction service verifies it server-side, then persist the result. Authorization is the
 * capability token (form/JSON `editToken`), verified server-side; `vcapi`/`exchangeId` are read
 * from the persisted match, never trusted from the client. This is used by embedded-wallet variants
 * that receive the VP in-browser instead of via the interaction-URL QR flow.
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	let body: { editToken?: unknown; verifiablePresentation?: unknown };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const editToken = typeof body.editToken === 'string' ? body.editToken : '';
	if (body.verifiablePresentation == null) {
		return json({ error: 'Missing verifiablePresentation' }, { status: 400 });
	}

	const match = await matchByIdQuery({ id: params.matchId });
	if (!match || match.jobId !== params.id) {
		return json({ error: 'Match not found' }, { status: 404 });
	}
	if (isMatchExpired(match, now())) {
		return json({ error: 'This match has expired' }, { status: 410 });
	}
	if (!verifyMatchCapability(match, editToken)) {
		return json({ error: 'Not authorized' }, { status: 403 });
	}
	if (!match.exchangeId || !match.vcapi) {
		return json({ error: 'No active exchange to submit to' }, { status: 409 });
	}

	const { verificationExchange } = appContext();
	let status;
	try {
		status = await verificationExchange.submitPresentation({
			vcapi: match.vcapi,
			verifiablePresentation: body.verifiablePresentation
		});
	} catch (err) {
		appLogger().error(
			{ err, matchId: params.matchId, requestId: locals.requestId },
			'present: failed to relay presentation'
		);
		// A 4xx from the transaction service means the VP itself was rejected (e.g. bad
		// challenge/proof); anything else is treated as an upstream/transport failure.
		const upstream = err instanceof VerificationExchangeError ? err.status : undefined;
		const isRejection = upstream !== undefined && upstream >= 400 && upstream < 500;
		return json(
			{
				error: isRejection ? 'Presentation could not be verified' : 'Could not submit presentation'
			},
			{ status: isRejection ? 422 : 502 }
		);
	}

	// Persist + return the result for both `complete` and `invalid` (a verifier-core result exists
	// for either), so a usable-but-imperfect presentation still lands the applicant on the board.
	// The `catch` above already handled hard VP rejections (no result) as 422/502.
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
