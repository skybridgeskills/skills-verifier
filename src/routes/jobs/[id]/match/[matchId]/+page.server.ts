import { error, fail, redirect, type ActionFailure } from '@sveltejs/kit';
import QRCode from 'qrcode';
import { z } from 'zod';

import { readEmbedLaunchParams } from '$lib/components/exchange-panel/embed-launch-params.js';
import { appContext } from '$lib/server/app-context.js';
import { jobByIdQuery } from '$lib/server/domain/job/job-by-id-query.js';
import { deleteMatchQuery } from '$lib/server/domain/match/delete-match-query.js';
import { matchByIdQuery } from '$lib/server/domain/match/match-by-id-query.js';
import {
	isMatchExpired,
	verifyMatchCapability
} from '$lib/server/domain/match/match-capability.js';
import { ExpiryDays, MatchAssignment } from '$lib/server/domain/match/match-resource.js';
import type { MatchResource } from '$lib/server/domain/match/match-resource.js';
import { saveMatchCredentialsQuery } from '$lib/server/domain/match/save-match-credentials-query.js';
import { updateMatchQuery } from '$lib/server/domain/match/update-match-query.js';
import { extractPresentationChallenge } from '$lib/server/domain/verification/parse-exchange-response.js';
import { appLogger } from '$lib/server/services/logging/index.js';

import type { Actions, PageServerLoad } from './$types';

import { env as publicEnv } from '$env/dynamic/public';

/** LearnCard host origin for the partner-connect embed variant (configurable; safe default). */
const DEFAULT_LEARNCARD_HOST_ORIGIN = 'https://learncard.app';

/** Current wall-clock time from the injected time service (never `Date.now()` directly). */
function now(): Date {
	return new Date(appContext().timeService.dateNowMs());
}

/** Strip the secret capability token so the read-only share payload can never expose it. */
function redactCapability(match: MatchResource): Omit<MatchResource, 'capabilityToken'> {
	const { capabilityToken: _capabilityToken, ...rest } = match;
	return rest;
}

export const load: PageServerLoad = async ({ params, url }) => {
	const job = await jobByIdQuery({ id: params.id });
	if (!job) error(404, 'Job not found');
	const match = await matchByIdQuery({ id: params.matchId });
	if (!match || match.jobId !== job.id) error(404, 'Match not found');

	if (isMatchExpired(match, now())) {
		error(410, 'This match has expired');
	}

	// The capability check is server-side only; the client is never trusted with the token.
	const canEdit = verifyMatchCapability(match, url.searchParams.get('edit'));

	// Presentation-only variant flags (no effect on auth). `embedMode` selects the LearnCard
	// partner-connect request flow; `learnCardHostOrigin` configures that SDK's host origin.
	// `readEmbedLaunchParams` repairs LearnCard's malformed double-`?` launch URL so a direct/mangled
	// match landing behaves like the client path: a recovered valid https `lc_host_override` takes
	// precedence over the env default.
	const { embed: embedMode, hostOrigin: recoveredHostOrigin } = readEmbedLaunchParams(url);
	const learnCardHostOrigin =
		recoveredHostOrigin ??
		(publicEnv.PUBLIC_LEARNCARD_HOST_ORIGIN || DEFAULT_LEARNCARD_HOST_ORIGIN);

	return {
		job,
		// Never leak the token into the read-only payload; only when the caller already
		// presented it (canEdit) is the full match — including its token — echoed back.
		match: canEdit ? match : redactCapability(match),
		canEdit,
		editToken: canEdit ? match.capabilityToken : null,
		embedMode,
		learnCardHostOrigin
	};
};

/**
 * Re-load the match and verify the form-supplied capability token **server-side** before any
 * mutation. The URL/form token is the only authorization: 404 if the match is gone, 410 if it
 * has expired, 403 if the token is missing/invalid.
 */
async function authorizeEdit(
	params: { id: string; matchId: string },
	token: string
): Promise<{ match: MatchResource } | ActionFailure<{ error: string }>> {
	const match = await matchByIdQuery({ id: params.matchId });
	if (!match || match.jobId !== params.id) {
		return fail(404, { error: 'Match not found' });
	}
	if (isMatchExpired(match, now())) {
		return fail(410, { error: 'This match has expired' });
	}
	if (!verifyMatchCapability(match, token)) {
		return fail(403, { error: 'Not authorized to edit' });
	}
	return { match };
}

export const actions: Actions = {
	startExchange: async ({ params, request, locals }) => {
		const fd = await request.formData();
		const auth = await authorizeEdit(params, String(fd.get('editToken') ?? ''));
		if ('status' in auth) return auth;

		const { verificationExchange } = appContext();
		let exchangeId: string;
		let protocols: {
			iu: string;
			vcapi: string;
			lcw: string;
			verifiablePresentationRequest: object;
		};
		try {
			const created = await verificationExchange.createVerifyExchange();
			exchangeId = created.exchangeId;
			protocols = created.protocols;
		} catch (err) {
			appLogger().error(
				{ err, matchId: params.matchId, requestId: locals.requestId },
				'startExchange: failed to create verify exchange'
			);
			return fail(502, { error: 'Could not start verification exchange' });
		}

		await saveMatchCredentialsQuery({
			id: params.matchId,
			exchangeId,
			vcapi: protocols.vcapi,
			exchangeState: 'pending'
		});

		// The `challenge`/`domain` a wallet must sign against live in the exchange VPR. Surface them
		// so an embedded client (LearnCard) can sign the VP against the values the verifier expects.
		// Fall back to fetching the VPR from the participate endpoint if the create response lacked them.
		let challenge = '';
		let domain = '';
		try {
			({ challenge, domain } = extractPresentationChallenge(
				protocols.verifiablePresentationRequest
			));
		} catch {
			try {
				({ challenge, domain } = await verificationExchange.fetchExchangeVpr({
					vcapi: protocols.vcapi
				}));
			} catch (err) {
				appLogger().warn(
					{ err, matchId: params.matchId, requestId: locals.requestId },
					'startExchange: could not resolve VPR challenge/domain'
				);
			}
		}

		const qrDataUrl = await QRCode.toDataURL(protocols.iu);

		return {
			iu: protocols.iu,
			lcw: protocols.lcw,
			vcapi: protocols.vcapi,
			qrDataUrl,
			exchangeId,
			challenge,
			domain
		};
	},

	saveAssignments: async ({ params, request }) => {
		const fd = await request.formData();
		const auth = await authorizeEdit(params, String(fd.get('editToken') ?? ''));
		if ('status' in auth) return auth;
		const { match } = auth;

		const job = await jobByIdQuery({ id: params.id });
		if (!job) {
			return fail(404, { error: 'Job not found' });
		}

		const raw = String(fd.get('assignmentsJson') ?? '');
		let parsedJson: unknown;
		try {
			parsedJson = raw ? JSON.parse(raw) : [];
		} catch {
			return fail(400, { error: 'Invalid assignments payload' });
		}

		const parsed = z.array(MatchAssignment.schema).safeParse(parsedJson);
		if (!parsed.success) {
			return fail(400, { error: 'Assignments must be a valid list' });
		}

		// Validate refs: each assignment must point at a real job skill and a verified
		// credential on this match. Reject unknown references rather than silently dropping.
		const jobSkills = new Set(job.skills.map((s) => `${s.ctid}|${s.url}`));
		const credentialIds = new Set(match.verifiedCredentials.map((c) => c.credentialId));
		for (const a of parsed.data) {
			if (!jobSkills.has(`${a.skillCtid}|${a.skillUrl}`)) {
				return fail(400, { error: `Unknown skill reference: ${a.skillCtid}` });
			}
			if (!credentialIds.has(a.credentialId)) {
				return fail(400, { error: `Unknown credential reference: ${a.credentialId}` });
			}
		}

		// Optional expiry preset ("Keep this match for" 30/60/90); default to no change if absent/invalid.
		const rawExpiry = fd.get('expiryDays');
		const expiry = rawExpiry != null ? ExpiryDays.safeParse(Number(rawExpiry)) : null;
		const expiryDays = expiry?.success ? expiry.data : undefined;

		await updateMatchQuery({ id: params.matchId, assignments: parsed.data, expiryDays });
		return { success: true };
	},

	deleteMatch: async ({ params, request }) => {
		const fd = await request.formData();
		const auth = await authorizeEdit(params, String(fd.get('editToken') ?? ''));
		if ('status' in auth) return auth;

		await deleteMatchQuery({ id: params.matchId });
		redirect(303, `/jobs/${params.id}`);
	}
};
